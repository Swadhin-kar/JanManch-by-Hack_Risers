const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lawSchema = new Schema({
    title: { type: String, required: true },
    proposedBy: { type: String, required: true },
    mainField: { type: String, required: true },
    relatedClasses: { type: String, required: true },
    endTime: { type: Date, required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['On-going', 'Closed', 'Proposed'],
        default: 'Proposed'
    },
    analysisResults: {
        overallReviewCount: Number,
        overallSentiment: String,
        pieChartData: Schema.Types.Mixed,
        ageChart: String,
        genderChart: String,
        professionChart: String,
        overallChart: String
    }
});

const Law = mongoose.model("Law", lawSchema);
module.exports = Law;