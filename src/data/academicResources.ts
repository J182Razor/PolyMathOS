export const ACADEMIC_RESOURCES = {
  datasets: [
    // General Academic
    { name: 'Kaggle Datasets', url: 'https://www.kaggle.com/datasets', category: 'General', description: 'Academic subjects, research data, competition datasets' },
    { name: 'UCI Machine Learning Repository', url: 'https://archive.ics.uci.edu/ml/', category: 'General', description: '500+ datasets for machine learning and data science' },
    { name: 'Google Dataset Search', url: 'https://datasetsearch.research.google.com/', category: 'General', description: 'Meta-search engine for datasets across repositories' },
    { name: 'Figshare', url: 'https://figshare.com/', category: 'General', description: 'Research outputs including datasets, figures, posters' },
    { name: 'Dryad Digital Repository', url: 'https://datadryad.org/', category: 'General', description: 'Curated research data underlying scientific publications' },
    
    // Mathematics & Statistics
    { name: 'Mathematical Functions Database', url: 'https://functions.wolfram.com/', category: 'Mathematics', description: '300,000+ formulas and identities' },
    { name: 'OEIS', url: 'https://oeis.org/', category: 'Mathematics', description: 'Online Encyclopedia of Integer Sequences' },
    { name: 'StatLib', url: 'http://lib.stat.cmu.edu/', category: 'Statistics', description: 'Carnegie Mellon University statistical datasets' },
    { name: 'IMSL Data Library', url: 'https://www.ima.umn.edu/~arnold/455.f96/Data/data.html', category: 'Statistics', description: 'Applied mathematics and statistics datasets' },

    // Computer Science
    { name: 'GitHub Public Repositories', url: 'https://github.com/', category: 'Computer Science', description: 'Open source projects and code examples' },
    { name: 'Awesome Public Datasets', url: 'https://github.com/awesomedata/awesome-public-datasets', category: 'Computer Science', description: 'Curated list of public datasets by category' },
    { name: 'OpenML', url: 'https://www.openml.org/', category: 'Computer Science', description: 'Machine learning datasets and experiments' },
    { name: 'TensorFlow Datasets', url: 'https://www.tensorflow.org/datasets', category: 'Computer Science', description: 'Ready-to-use datasets for machine learning' },

    // Scientific Research
    { name: 'NASA Open Data Portal', url: 'https://data.nasa.gov/', category: 'Science', description: 'Space science, earth science, astronomy datasets' },
    { name: 'NOAA National Centers', url: 'https://www.ncdc.noaa.gov/', category: 'Science', description: 'Climate, weather, oceanographic data' },
    { name: 'USGS Earth Explorer', url: 'https://earthexplorer.usgs.gov/', category: 'Science', description: 'Satellite imagery and geospatial data' },
    { name: 'European Open Science Cloud', url: 'https://www.eosc-portal.eu/', category: 'Science', description: 'European research data repository' },

    // Biology
    { name: 'NCBI Databases', url: 'https://www.ncbi.nlm.nih.gov/', category: 'Biology', description: 'GenBank, PubMed Central, GEO datasets' },
    { name: 'EMBL-EBI', url: 'https://www.ebi.ac.uk/', category: 'Biology', description: 'European bioinformatics institute resources' },
    { name: 'OpenNeuro', url: 'https://openneuro.org/', category: 'Biology', description: 'Neuroimaging datasets' },

    // Physics
    { name: 'CERN Open Data Portal', url: 'http://opendata.cern.ch/', category: 'Physics', description: 'Particle physics experimental data' },
    { name: 'NIST Physics Laboratory', url: 'https://physics.nist.gov/', category: 'Physics', description: 'Physical constants, atomic spectra' },
    { name: 'Materials Project', url: 'https://materialsproject.org/', category: 'Physics', description: 'Computational materials science database' }
  ],
  
  courses: [
    // MOOCs
    { name: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu/', category: 'MOOC', description: '2,700+ courses from MIT' },
    { name: 'Stanford Online', url: 'https://online.stanford.edu/', category: 'MOOC', description: 'Free courses and lectures' },
    { name: 'Coursera', url: 'https://www.coursera.org/', category: 'MOOC', description: 'University-level courses from top institutions' },
    { name: 'edX', url: 'https://www.edx.org/', category: 'MOOC', description: 'Harvard, MIT, Berkeley offerings' },
    { name: 'Khan Academy', url: 'https://www.khanacademy.org/', category: 'MOOC', description: 'K-12 and college-level courses' },
    { name: 'NPTEL', url: 'https://nptel.ac.in/', category: 'MOOC', description: '20,000+ video courses from Indian Institutes' },

    // Specialized
    { name: 'OpenLearn', url: 'https://www.open.edu/openlearn/', category: 'Specialized', description: 'Free university-level courses' },
    { name: 'Alison', url: 'https://alison.com/', category: 'Specialized', description: 'Free online courses and certifications' },
    { name: 'FutureLearn', url: 'https://www.futurelearn.com/', category: 'Specialized', description: 'Many free courses with paid upgrades' },
    { name: 'Saylor Academy', url: 'https://www.saylor.org/', category: 'Specialized', description: 'Free college courses and programs' },

    // Mathematics
    { name: 'Paul\'s Online Math Notes', url: 'http://tutorial.math.lamar.edu/', category: 'Mathematics', description: 'Free mathematics tutorials' },
    { name: 'Stat Trek', url: 'https://stattrek.com/', category: 'Mathematics', description: 'Statistics tutorials and tools' },
    { name: 'BetterExplained', url: 'https://betterexplained.com/', category: 'Mathematics', description: 'Intuitive mathematics explanations' },

    // CS
    { name: 'CS50 (Harvard)', url: 'https://cs50.harvard.edu/', category: 'Computer Science', description: 'Introduction to Computer Science' },
    { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org/', category: 'Computer Science', description: 'Coding bootcamp curriculum' },
    { name: 'The Odin Project', url: 'https://www.theodinproject.com/', category: 'Computer Science', description: 'Full-stack web development curriculum' },
    { name: 'Teach Yourself CS', url: 'https://teachyourselfcs.com/', category: 'Computer Science', description: 'Guide to self-taught computer science' },

    // Physics
    { name: 'Feynman Lectures on Physics', url: 'http://www.feynmanlectures.caltech.edu/', category: 'Physics', description: 'Complete physics lectures by Richard Feynman' },
    { name: 'OpenStax', url: 'https://openstax.org/', category: 'Physics', description: 'Free peer-reviewed textbooks' }
  ],

  papers: [
    // Repositories
    { name: 'arXiv', url: 'https://arxiv.org/', category: 'Repository', description: 'Preprints in Physics, Mathematics, Computer Science' },
    { name: 'PubMed Central', url: 'https://www.ncbi.nlm.nih.gov/pmc/', category: 'Repository', description: 'Biomedical and life sciences literature' },
    { name: 'PLoS ONE', url: 'https://journals.plos.org/plosone/', category: 'Journal', description: 'Open access scientific journal' },
    { name: 'DOAJ', url: 'https://doaj.org/', category: 'Directory', description: 'Directory of Open Access Journals' },
    { name: 'CORE', url: 'https://core.ac.uk/', category: 'Aggregator', description: 'Aggregator of open access research papers' },
    { name: 'Semantic Scholar', url: 'https://www.semanticscholar.org/', category: 'Search Engine', description: 'AI-powered scientific literature search' },
    { name: 'Google Scholar', url: 'https://scholar.google.com/', category: 'Search Engine', description: 'Broad academic search engine' },
    { name: 'JSTOR Open Content', url: 'https://about.jstor.org/oa-content/', category: 'Repository', description: 'Open access journals and books' },
    { name: 'Project MUSE', url: 'https://muse.jhu.edu/', category: 'Repository', description: 'Humanities and social sciences' },
    { name: 'ERIC', url: 'https://eric.ed.gov/', category: 'Repository', description: 'Education research and resources' }
  ],

  government: [
    { name: 'Data.gov', url: 'https://www.data.gov/', category: 'Government', description: 'U.S. government datasets' },
    { name: 'EU Open Data Portal', url: 'https://data.europa.eu/en', category: 'Government', description: 'European Union datasets' },
    { name: 'World Bank Open Data', url: 'https://data.worldbank.org/', category: 'Government', description: 'Global development data' },
    { name: 'UN Data', url: 'http://data.un.org/', category: 'Government', description: 'United Nations statistical databases' },
    { name: 'OECD Data', url: 'https://data.oecd.org/', category: 'Government', description: 'Economic cooperation data' }
  ]
};

