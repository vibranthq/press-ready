import mongoose from 'mongoose'

const pageSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'processing', 'processed', 'failed'],
    default: 'pending',
  },
  sourceFilePath: { type: String, required: true },
  targetFilePath: { type: String, required: true },
  containerId: { type: String },
  webhookAuthCode: { type: String },
  created: { type: Date, default: Date.now },
})

export default mongoose.model('Page', pageSchema)
