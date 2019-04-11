import fs from 'fs'
import express from 'express'
import multer from 'multer'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import uuid from 'uuid'
import AWS from 'aws-sdk'
import assert from 'assert'

import Page from './models/page'
import { createContainer, startContainer } from './lib/hyper'

// Config
const awsRegion = process.env.AWS_REGION
const awsBucket = process.env.AWS_BUCKET
assert(awsRegion)
assert(awsBucket)

async function uploadFile(fileKey, filePath) {
  const s3params = {
    Bucket: awsBucket,
    Key: fileKey,
    Body: fs.readFileSync(filePath),
    ContentType: 'application/pdf',
  }

  try {
    console.log('Uploading to S3')
    const data = await s3.putObject(s3params).promise()
    return data
  } catch (err) {
    console.log('S3 Error', err, err.stack)
    throw new Error(err)
  }
}

const app = express()
app.set('view engine', 'pug')
app.set('port', process.env.PORT || 3000)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.set('webhookHost', process.env.WEBHOOK_HOST || 'http://localhost:3000')
app.set(
  'mongoURL',
  process.env.MONGODB_URL || 'mongodb://localhost/press-ready'
)

// MongoDB
mongoose.connect(app.get('mongoURL'), { useNewUrlParser: true })

// Amazon S3
AWS.config.update({
  region: awsRegion,
})
const s3 = new AWS.S3()

function getS3URL(key) {
  return `s3://${awsBucket}/${key}`
}

const upload = multer({ dest: 'uploads/' })

// show upload form
app.get('/', function(req, res) {
  res.render('index')
})

// upload PDF document to S3
app.post('/pages', upload.single('pdffile'), async function(req, res) {
  const uploadedFilePath = req.file.path
  const canonicalID = uuid()
  const webhookAuthCode = uuid()
  const sourceFilePath = `${canonicalID}-source.pdf`
  const targetFilePath = `${canonicalID}-target.pdf`

  // create page to database
  const page = new Page({
    sourceFilePath,
    targetFilePath,
    webhookAuthCode,
  })
  await page.save()

  try {
    const data = await uploadFile(sourceFilePath, uploadedFilePath)

    const webhookURL = `${app.get('webhookHost')}/pages/${
      page.id
    }/update_status`
    const container = await createContainer(
      getS3URL(sourceFilePath),
      getS3URL(targetFilePath),
      webhookURL,
      webhookAuthCode
    )

    await startContainer(container.Id)

    page.containerId = container.Id
    page.status = 'processing'
    await page.save()

    res.redirect(`/pages/${page.id}`)
  } catch (err) {
    console.log('Error', err, err.stack)
    res.json({ error: err.message })
  }
})

// webhook endpoint
app.post('/pages/:id/update_status', async function(req, res) {
  const {
    params: { id },
    body: { auth_code, exit_code },
  } = req

  console.log(id, exit_code)

  const page = await Page.findById(id)

  if (!auth_code || page.webhookAuthCode !== auth_code) {
    res.statusCode = 402
    return res.json({ error: 'invalid auth code given' })
  }

  const isSucceeded = exit_code && exit_code === '0'
  const status = isSucceeded ? 'processed' : 'failed'

  await page.updateOne({ status })

  res.json({ status })
})

// status for each page
app.get('/pages/:id', async function(req, res) {
  const { id } = req.params
  const page = await Page.findById(id)

  const params = {}
  params.status = page.status

  if (page.status === 'processed') {
    params.downloadURL = s3.getSignedUrl('getObject', {
      Bucket: awsBucket,
      Key: page.targetFilePath,
      Expires: 5 * 60,
    })
  }

  res.render('page', params)
})

export default app
