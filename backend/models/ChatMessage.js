const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatMessageSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, maxlength: 4000 },
  },
  { timestamps: true }
);

chatMessageSchema.index({ projectId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
