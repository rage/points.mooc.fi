import * as Kafka from "node-rdkafka"
import { ConsumerGlobalConfig } from "node-rdkafka"
import winston from "winston"
import { KafkaError } from "../../lib/errors"
import checkConnectionInInterval from "./connectedChecker"
import type { PrismaClient } from "@prisma/client"
import { attachPrismaEvents } from "../../../util/prismaLogger"
import { v4 } from "uuid"

const logCommit = (logger: winston.Logger) => (
  err: any,
  topicPartitions: any,
) => {
  if (err) {
    logger.error(new KafkaError("Error in commit", err))
  } else {
    logger.info("Committed. topicPartitions:" + JSON.stringify(topicPartitions))
  }
}

interface CreateKafkaConsumer {
  logger: winston.Logger
  prisma?: PrismaClient
}

export const createKafkaConsumer = ({
  logger,
  prisma,
}: CreateKafkaConsumer) => {
  let consumerGroup = process.env.KAFKA_CONSUMER_GROUP ?? "kafka"
  if (process.env.KAFKA_TOP_OF_THE_QUEUE) {
    consumerGroup = v4()
  }
  logger.info(`Joining consumer group ${consumerGroup}.`)

  const globalConfig: ConsumerGlobalConfig = {
    "group.id": consumerGroup,
    "metadata.broker.list": process.env.KAFKA_HOST,
    offset_commit_cb: logCommit(logger),
    "enable.auto.commit": false,
    "partition.assignment.strategy": "roundrobin",
  }
  if (process.env.KAFKA_DEBUG_CONTEXTS) {
    globalConfig["debug"] = process.env.KAFKA_DEBUG_CONTEXTS
  }

  const consumer = new Kafka.KafkaConsumer(globalConfig, {
    "auto.offset.reset": process.env.KAFKA_TOP_OF_THE_QUEUE
      ? "latest"
      : "earliest",
  })

  consumer.on("event.error", (error) => {
    logger.error(new KafkaError("Error", error))
    process.exit(-1)
  })

  consumer.on("event.log", function (log) {
    console.log(log)
  })

  consumer.on("connection.failure", (err, metrics) => {
    logger.info("Connection failed with " + err)
    logger.info("Metrics: " + JSON.stringify(metrics))
    consumer.connect()
  })

  checkConnectionInInterval(consumer)

  if (prisma) {
    attachPrismaEvents({
      logger,
      prisma,
    })
  }
  return consumer
}
