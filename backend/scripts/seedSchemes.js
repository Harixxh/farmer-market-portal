const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Scheme = require('../models/Scheme');

// Official Government Schemes for Farmers in India
const officialSchemes = [
  {
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    description: 'Direct income support of Rs. 6,000 per year to farmer families, paid in three equal installments of Rs. 2,000 each. Benefits all landholding farmer families having cultivable land.',
    type: 'Subsidy',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: 'All landholding farmer families with cultivable land, subject to exclusion criteria',
    link: 'https://pmkisan.gov.in',
    status: 'Active'
  },
  {
    name: 'PM Fasal Bima Yojana (PMFBY)',
    description: 'Comprehensive crop insurance scheme providing insurance coverage and financial support to farmers in the event of crop failure due to natural calamities, pests and diseases.',
    type: 'Insurance',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: 'All farmers growing notified crops in notified areas',
    link: 'https://pmfby.gov.in',
    status: 'Active'
  },
  {
    name: 'Kisan Credit Card (KCC)',
    description: 'Provides adequate and timely credit support from the banking system to farmers for their cultivation and other needs including term loan for agriculture and allied activities.',
    type: 'Loan',
    ministry: 'Ministry of Finance',
    eligibility: 'Farmers, sharecroppers, tenant farmers and SHGs/JLGs of farmers',
    link: 'https://www.pmkisan.gov.in/kcc',
    status: 'Active'
  },
  {
    name: 'Soil Health Card Scheme',
    description: 'Provides soil health cards to farmers which carry crop-wise recommendations of nutrients and fertilizers required for individual farms to help improve productivity.',
    type: 'Support',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: 'All farmers across India',
    link: 'https://soilhealth.dac.gov.in',
    status: 'Active'
  },
  {
    name: 'PM Krishi Sinchai Yojana (PMKSY)',
    description: 'Aims to extend coverage of irrigation and improve water use efficiency through micro irrigation technologies like drip and sprinkler irrigation.',
    type: 'Subsidy',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: 'All farmers with agricultural land',
    link: 'https://pmksy.gov.in',
    status: 'Active'
  },
  {
    name: 'e-NAM (National Agriculture Market)',
    description: 'Pan-India electronic trading portal that networks existing APMC mandis to create a unified national market for agricultural commodities.',
    type: 'Support',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: 'Farmers, traders, buyers registered on e-NAM platform',
    link: 'https://enam.gov.in',
    status: 'Active'
  },
  {
    name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
    description: 'Promotes organic farming through cluster approach. Farmers are provided Rs. 50,000 per hectare for 3 years for organic inputs, certification and labeling.',
    type: 'Subsidy',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: 'Farmers willing to adopt organic farming in cluster mode',
    link: 'https://pgsindia-ncof.gov.in/pkvy',
    status: 'Active'
  },
  {
    name: 'Agriculture Infrastructure Fund (AIF)',
    description: 'Financing facility of Rs. 1 lakh crore for development of post-harvest management infrastructure and community farming assets through interest subvention and credit guarantee.',
    type: 'Loan',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: 'Farmers, FPOs, Cooperatives, Start-ups, Agri-entrepreneurs',
    link: 'https://agriinfra.dac.gov.in',
    status: 'Active'
  },
  {
    name: 'PM Kisan Maandhan Yojana',
    description: 'Voluntary pension scheme for small and marginal farmers. After attaining age of 60, beneficiaries receive minimum pension of Rs. 3,000 per month.',
    type: 'Support',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: 'Small and marginal farmers aged 18-40 years with landholding up to 2 hectares',
    link: 'https://maandhan.in',
    status: 'Active'
  },
  {
    name: 'National Mission on Sustainable Agriculture (NMSA)',
    description: 'Promotes sustainable agriculture through integrated farming, appropriate soil health management and synergizing resource conservation.',
    type: 'Support',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: 'All farmers adopting sustainable agriculture practices',
    link: 'https://nmsa.dac.gov.in',
    status: 'Active'
  },
  {
    name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    description: 'Promotes farm mechanization by providing subsidies on purchase of agricultural machinery and equipment.',
    type: 'Subsidy',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: 'Individual farmers, FPOs, cooperatives, entrepreneurs',
    link: 'https://agrimachinery.nic.in',
    status: 'Active'
  },
  {
    name: 'National Horticulture Mission (NHM)',
    description: 'Promotes holistic growth of horticulture sector including fruits, vegetables, root and tuber crops, mushrooms, spices, flowers, etc.',
    type: 'Subsidy',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    eligibility: 'Farmers engaged in horticulture activities',
    link: 'https://nhb.gov.in',
    status: 'Active'
  }
];

const seedSchemes = async () => {
  try {
    await mongoose.connect(process.env.dbpassword);
    console.log('Connected to MongoDB');

    // Check existing schemes
    const existingCount = await Scheme.countDocuments();
    console.log(`Existing schemes: ${existingCount}`);

    if (existingCount === 0) {
      // Insert schemes
      await Scheme.insertMany(officialSchemes);
      console.log(`Successfully added ${officialSchemes.length} government schemes`);
    } else {
      console.log('Schemes already exist. Updating...');
      for (const scheme of officialSchemes) {
        await Scheme.findOneAndUpdate(
          { name: scheme.name },
          scheme,
          { upsert: true, new: true }
        );
      }
      console.log('Schemes updated successfully');
    }

    await mongoose.connection.close();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding schemes:', error);
    process.exit(1);
  }
};

seedSchemes();
