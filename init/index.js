
require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require('mongoose');
const express = require('express');
const Law = require('../models/law.js');
const laws=[
  {
    "title": "Data Privacy and Security Act",
    "proposedBy": "Technology & Privacy Committee",
    "mainField": "Data Privacy and Consumer Rights",
    "relatedClasses": "Consumers, Businesses",
    "endTime": "2026-01-15T00:00:00.000Z",
    "description": "A new law to regulate how personal data is collected, stored, and used by corporations, giving citizens more control over their digital footprint."
  },
  {
    "title": "School Curriculum Modernization Bill",
    "proposedBy": "Ministry of Education",
    "mainField": "Education",
    "relatedClasses": "Students, Teachers, Parents",
    "endTime": "2025-11-20T00:00:00.000Z",
    "description": "This bill aims to update the national school curriculum to include more vocational and digital skills training."
  },
  {
    "title": "Affordable Healthcare Reform",
    "proposedBy": "Public Health Task Force",
    "mainField": "Healthcare",
    "relatedClasses": "General Public, Doctors, Patients",
    "endTime": "2026-03-01T00:00:00.000Z",
    "description": "Legislation designed to expand access to healthcare services and reduce medical costs for low-income families."
  },
  {
    "title": "Environmental Conservation Act",
    "proposedBy": "Environmental Protection Agency",
    "mainField": "Environment",
    "relatedClasses": "Farmers, Businesses, General Public",
    "endTime": "2025-10-30T00:00:00.000Z",
    "description": "This law sets stricter limits on industrial pollution and promotes sustainable farming practices to protect natural resources."
  },
  {
    "title": "Fair Labor Standards Amendment",
    "proposedBy": "Labor Union",
    "mainField": "Labor Rights",
    "relatedClasses": "Workers, Employers, Government Employees",
    "endTime": "2025-12-10T00:00:00.000Z",
    "description": "An amendment to establish a new minimum wage and ensure safer working conditions in all industries."
  },
  {
    "title": "Juvenile Justice Reform Bill",
    "proposedBy": "Judiciary Committee",
    "mainField": "Criminal Law",
    "relatedClasses": "Children, Youth, Legal Professionals",
    "endTime": "2026-02-28T00:00:00.000Z",
    "description": "A bill to overhaul the juvenile justice system, focusing more on rehabilitation and educational programs rather than punitive measures."
  },
  {
    "title": "Equal Pay for Equal Work Act",
    "proposedBy": "Civil Rights Organization",
    "mainField": "Civil Rights",
    "relatedClasses": "Women, General Public, Businesses",
    "endTime": "2025-09-30T00:00:00.000Z",
    "description": "A law to ensure that individuals performing the same job receive the same compensation, regardless of gender or ethnicity."
  },
  {
    "title": "Tax Evasion Prevention Bill",
    "proposedBy": "Ministry of Finance",
    "mainField": "Taxation",
    "relatedClasses": "Businesses, General Public",
    "endTime": "2026-04-15T00:00:00.000Z",
    "description": "Legislation to close loopholes and increase penalties for tax evasion, aiming to generate more revenue for public services."
  },
  {
    "title": "Student Loan Relief Initiative",
    "proposedBy": "Legislative Assembly",
    "mainField": "Education",
    "relatedClasses": "Students, Young Professionals",
    "endTime": "2026-05-01T00:00:00.000Z",
    "description": "A new initiative to provide partial student loan forgiveness for graduates entering public service careers."
  },
  {
    "title": "Internet Regulation and Access Bill",
    "proposedBy": "Telecommunications Commission",
    "mainField": "Data Privacy and Consumer Rights",
    "relatedClasses": "Consumers, Internet Service Providers",
    "endTime": "2026-06-10T00:00:00.000Z",
    "description": "A bill to regulate internet service providers and ensure fair pricing and equal access for all citizens."
  }
  ,
  {
    "title": "Data Privacy and Security Act",
    "proposedBy": "Technology & Privacy Committee",
    "mainField": "Data Privacy and Consumer Rights",
    "relatedClasses": "Consumers, Businesses",
    "endTime": "2026-01-15T00:00:00.000Z",
    "description": "A new law to regulate how personal data is collected, stored, and used by corporations, giving citizens more control over their digital footprint.",
    "status": "On-going"
  },
  {
    "title": "School Curriculum Modernization Bill",
    "proposedBy": "Ministry of Education",
    "mainField": "Education",
    "relatedClasses": "Students, Teachers, Parents",
    "endTime": "2025-11-20T00:00:00.000Z",
    "description": "This bill aims to update the national school curriculum to include more vocational and digital skills training.",
    "status": "On-going"
  },
  {
    "title": "Affordable Healthcare Reform",
    "proposedBy": "Public Health Task Force",
    "mainField": "Healthcare",
    "relatedClasses": "General Public, Doctors, Patients",
    "endTime": "2026-03-01T00:00:00.000Z",
    "description": "Legislation designed to expand access to healthcare services and reduce medical costs for low-income families.",
    "status": "On-going"
  },
  {
    "title": "Environmental Conservation Act",
    "proposedBy": "Environmental Protection Agency",
    "mainField": "Environment",
    "relatedClasses": "Farmers, Businesses, General Public",
    "endTime": "2025-10-30T00:00:00.000Z",
    "description": "This law sets stricter limits on industrial pollution and promotes sustainable farming practices to protect natural resources.",
    "status": "On-going"
  },
  {
    "title": "Fair Labor Standards Amendment",
    "proposedBy": "Labor Union",
    "mainField": "Labor Rights",
    "relatedClasses": "Workers, Employers, Government Employees",
    "endTime": "2025-12-10T00:00:00.000Z",
    "description": "An amendment to establish a new minimum wage and ensure safer working conditions in all industries.",
    "status": "On-going"
  },
  {
    "title": "Juvenile Justice Reform Bill",
    "proposedBy": "Judiciary Committee",
    "mainField": "Criminal Law",
    "relatedClasses": "Children, Youth, Legal Professionals",
    "endTime": "2026-02-28T00:00:00.000Z",
    "description": "A bill to overhaul the juvenile justice system, focusing more on rehabilitation and educational programs rather than punitive measures.",
    "status": "On-going"
  },
  {
    "title": "Equal Pay for Equal Work Act",
    "proposedBy": "Civil Rights Organization",
    "mainField": "Civil Rights",
    "relatedClasses": "Women, General Public, Businesses",
    "endTime": "2025-09-30T00:00:00.000Z",
    "description": "A law to ensure that individuals performing the same job receive the same compensation, regardless of gender or ethnicity.",
    "status": "On-going"
  },
  {
    "title": "Tax Evasion Prevention Bill",
    "proposedBy": "Ministry of Finance",
    "mainField": "Taxation",
    "relatedClasses": "Businesses, General Public",
    "endTime": "2026-04-15T00:00:00.000Z",
    "description": "Legislation to close loopholes and increase penalties for tax evasion, aiming to generate more revenue for public services.",
    "status": "On-going"
  },
  {
    "title": "Student Loan Relief Initiative",
    "proposedBy": "Legislative Assembly",
    "mainField": "Education",
    "relatedClasses": "Students, Young Professionals",
    "endTime": "2026-05-01T00:00:00.000Z",
    "description": "A new initiative to provide partial student loan forgiveness for graduates entering public service careers.",
    "status": "On-going"
  },
  {
    "title": "Internet Regulation and Access Bill",
    "proposedBy": "Telecommunications Commission",
    "mainField": "Data Privacy and Consumer Rights",
    "relatedClasses": "Consumers, Internet Service Providers",
    "endTime": "2026-06-10T00:00:00.000Z",
    "description": "A bill to regulate internet service providers and ensure fair pricing and equal access for all citizens.",
    "status": "On-going"
  }

];
const initData={data:laws};

main().then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err);
});
async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}
const inititDb=async () => {
    await Law.deleteMany({});
    await Law.insertMany(initData.data);
    console.log("Database initialized with sample data");
};
inititDb();
 