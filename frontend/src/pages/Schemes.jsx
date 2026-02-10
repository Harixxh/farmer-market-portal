import React, { useState } from 'react'

const Schemes = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    { id: 'all', name: 'All Schemes' },
    { id: 'subsidy', name: 'Subsidies' },
    { id: 'loan', name: 'Loans & Credit' },
    { id: 'insurance', name: 'Insurance' },
    { id: 'training', name: 'Training & Support' },
    { id: 'equipment', name: 'Equipment' },
  ]

  const schemes = [
    {
      id: 1,
      name: 'PM-KISAN Samman Nidhi',
      category: 'subsidy',
      department: 'Ministry of Agriculture',
      description: 'Direct income support of ₹6,000 per year to farmer families, paid in three equal installments.',
      eligibility: ['All land-holding farmer families', 'Valid land records required', 'Aadhaar linked bank account'],
      benefits: '₹6,000/year in 3 installments',
      deadline: 'Ongoing',
      status: 'active',
      link: 'https://pmkisan.gov.in',
      documents: ['Aadhaar Card', 'Land Records', 'Bank Account Details'],
      matchScore: 95
    },
    {
      id: 2,
      name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      category: 'insurance',
      department: 'Ministry of Agriculture',
      description: 'Crop insurance scheme providing financial support to farmers suffering crop loss/damage due to unforeseen events.',
      eligibility: ['All farmers including sharecroppers', 'Farmers growing notified crops', 'Both loanee and non-loanee farmers'],
      benefits: 'Premium: 2% for Kharif, 1.5% for Rabi crops',
      deadline: 'Before sowing season',
      status: 'active',
      link: 'https://pmfby.gov.in',
      documents: ['Land Records', 'Bank Account', 'Sowing Certificate'],
      matchScore: 88
    },
    {
      id: 3,
      name: 'Kisan Credit Card (KCC)',
      category: 'loan',
      department: 'RBI / NABARD',
      description: 'Credit facility for farmers to meet their agricultural needs including crop production, post-harvest expenses, and farm maintenance.',
      eligibility: ['All farmers - individuals/joint borrowers', 'Tenant farmers and sharecroppers', 'SHGs or Joint Liability Groups'],
      benefits: 'Credit limit up to ₹3 lakh at 4% interest',
      deadline: 'Ongoing',
      status: 'active',
      link: 'https://www.nabard.org',
      documents: ['Identity Proof', 'Address Proof', 'Land Documents', 'Passport Photo'],
      matchScore: 92
    },
    {
      id: 4,
      name: 'Soil Health Card Scheme',
      category: 'training',
      department: 'Ministry of Agriculture',
      description: 'Provides soil health cards to farmers with crop-wise recommendations for nutrients and fertilizers.',
      eligibility: ['All farmers across India', 'No specific land holding requirement'],
      benefits: 'Free soil testing and recommendations',
      deadline: 'Ongoing',
      status: 'active',
      link: 'https://soilhealth.dac.gov.in',
      documents: ['Aadhaar Card', 'Land Details'],
      matchScore: 85
    },
    {
      id: 5,
      name: 'Sub-Mission on Agricultural Mechanization (SMAM)',
      category: 'equipment',
      department: 'Ministry of Agriculture',
      description: 'Subsidy scheme for purchase of agricultural machinery and equipment to promote farm mechanization.',
      eligibility: ['Individual farmers', 'Farmer groups/FPOs', 'Custom Hiring Centers'],
      benefits: '40-50% subsidy on equipment purchase',
      deadline: '31 March 2026',
      status: 'active',
      link: 'https://agrimachinery.nic.in',
      documents: ['Identity Proof', 'Land Records', 'Bank Account', 'Quotation from dealer'],
      matchScore: 78
    },
    {
      id: 6,
      name: 'National Mission on Sustainable Agriculture',
      category: 'training',
      department: 'Ministry of Agriculture',
      description: 'Promotes sustainable agriculture through climate-resilient practices, soil health management, and water use efficiency.',
      eligibility: ['Farmers in rainfed areas', 'Priority to small and marginal farmers'],
      benefits: 'Training, demonstrations, and input support',
      deadline: 'Ongoing',
      status: 'active',
      link: 'https://nmsa.dac.gov.in',
      documents: ['Aadhaar Card', 'Land Records'],
      matchScore: 72
    },
    {
      id: 7,
      name: 'Agriculture Infrastructure Fund (AIF)',
      category: 'loan',
      department: 'Ministry of Agriculture',
      description: 'Credit facility for investment in viable projects for post-harvest management and community farming assets.',
      eligibility: ['Farmers', 'FPOs', 'Agri-entrepreneurs', 'Startups'],
      benefits: 'Interest subvention of 3% on loans up to ₹2 crore',
      deadline: 'Ongoing till 2032',
      status: 'active',
      link: 'https://agriinfra.dac.gov.in',
      documents: ['Project Report', 'Identity Proof', 'Land Documents', 'Bank Statement'],
      matchScore: 65
    },
    {
      id: 8,
      name: 'Micro Irrigation Fund',
      category: 'subsidy',
      department: 'NABARD',
      description: 'Promotes micro irrigation (drip and sprinkler) to improve water use efficiency in agriculture.',
      eligibility: ['All farmers', 'Priority to those with bore wells/tubewells'],
      benefits: '55-90% subsidy based on category',
      deadline: 'Ongoing',
      status: 'active',
      link: 'https://pmksy.gov.in',
      documents: ['Land Records', 'Aadhaar Card', 'Water Source Proof'],
      matchScore: 82
    },
  ]

  const filteredSchemes = schemes
    .filter(s => selectedCategory === 'all' || s.category === selectedCategory)
    .filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.matchScore - a.matchScore)

  const [selectedScheme, setSelectedScheme] = useState(null)

  // SVG Icons
  const SearchIcon = () => (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )

  const CheckIcon = () => (
    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )

  const ExternalLinkIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )

  const DocumentIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )

  const CloseIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )

  const getCategoryColor = (category) => {
    const colors = {
      subsidy: 'bg-green-100 text-green-700',
      loan: 'bg-blue-100 text-blue-700',
      insurance: 'bg-purple-100 text-purple-700',
      training: 'bg-yellow-100 text-yellow-700',
      equipment: 'bg-orange-100 text-orange-700',
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Government Schemes</h1>
          <p className="text-gray-600 mt-1">Discover schemes and benefits available for farmers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Schemes</p>
            <p className="text-2xl font-bold text-gray-900">{schemes.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Subsidies</p>
            <p className="text-2xl font-bold text-green-600">{schemes.filter(s => s.category === 'subsidy').length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Loan Schemes</p>
            <p className="text-2xl font-bold text-blue-600">{schemes.filter(s => s.category === 'loan').length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">High Match</p>
            <p className="text-2xl font-bold text-purple-600">{schemes.filter(s => s.matchScore >= 80).length}</p>
          </div>
        </div>

        {/* Alert Banner */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <svg className="w-6 h-6 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-green-800">Personalized Recommendations</p>
            <p className="text-sm text-green-700">Schemes are sorted by match score based on your profile (location, crops, farm size). Update your profile for better recommendations.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="Search schemes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat.id 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Schemes List */}
        <div className="space-y-4">
          {filteredSchemes.map((scheme) => (
            <div key={scheme.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getCategoryColor(scheme.category)}`}>
                      {scheme.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      scheme.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                      scheme.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {scheme.matchScore}% Match
                    </span>
                    {scheme.status === 'active' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{scheme.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{scheme.department}</p>
                  <p className="text-gray-600 mb-4">{scheme.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Benefits: </span>
                      <span className="font-medium text-green-600">{scheme.benefits}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Deadline: </span>
                      <span className="font-medium text-gray-900">{scheme.deadline}</span>
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-col gap-2">
                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="flex-1 lg:flex-none px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Details
                  </button>
                  <a
                    href={scheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 lg:flex-none px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                  >
                    Apply <ExternalLinkIcon />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredSchemes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No schemes found matching your criteria</p>
          </div>
        )}

        {/* Scheme Details Modal */}
        {selectedScheme && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getCategoryColor(selectedScheme.category)}`}>
                      {selectedScheme.category}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedScheme.matchScore >= 80 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedScheme.matchScore}% Match
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedScheme.name}</h3>
                  <p className="text-sm text-gray-500">{selectedScheme.department}</p>
                </div>
                <button onClick={() => setSelectedScheme(null)} className="text-gray-400 hover:text-gray-600">
                  <CloseIcon />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedScheme.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Benefits</p>
                    <p className="font-semibold text-green-700">{selectedScheme.benefits}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-1">Deadline</p>
                    <p className="font-semibold text-blue-700">{selectedScheme.deadline}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Eligibility Criteria</h4>
                  <ul className="space-y-2">
                    {selectedScheme.eligibility.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckIcon />
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Required Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedScheme.documents.map((doc, index) => (
                      <span key={index} className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                        <DocumentIcon />
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedScheme(null)}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <a
                    href={selectedScheme.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Apply Now <ExternalLinkIcon />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Schemes
