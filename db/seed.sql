-- Seed data for Daily News Reader

INSERT INTO news (title, description, content, image_url, category, source, author, published_at) VALUES
-- Technology
(
    'Breakthrough in Next-Gen Quantum Microprocessors',
    'Researchers announce a major milestone in fault-tolerant quantum computing chips operating at room temperature.',
    'In a landmark paper published today, quantum computing researchers revealed a novel chip architecture capable of maintaining quantum coherence at significantly higher temperatures than previously possible. This achievement could accelerate commercial quantum applications by standardizing silicon manufacturing processes and eliminating ultra-deep cryogenic requirements.\n\nIndustry leaders predict that practical deployment in cryptography, molecular simulation, and complex logistics could begin as early as next year. "We are seeing the transition from speculative physics to scalable engineering," stated lead project engineer Dr. Elena Vance.',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'Technology',
    'TechCrunch Daily',
    'Alexander Wright',
    NOW() - INTERVAL '1 hour'
),
(
    'Autonomous AI Agents Transforming Modern Software Engineering',
    'Developer productivity metrics skyrocket as autonomous coding assistants handle routine bug fixes and testing.',
    'Software teams worldwide are rapidly adopting autonomous AI subagents into their daily build pipelines. Recent industry benchmark studies indicate a 40% reduction in cycle time for routine pull requests, code reviews, and dependency updates.\n\nWhile engineering management celebrates the acceleration, lead architects emphasize the growing importance of system verification and architectural governance. Human developers are shifting their focus toward strategic system design, safety bounds, and domain modeling.',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    'Technology',
    'Wired Chronicle',
    'Sarah Chen',
    NOW() - INTERVAL '3 hours'
),
(
    'Next-Generation Solar Cells Cross 34% Efficiency Barrier',
    'Perovskite-silicon tandem solar panels achieve historic efficiency rating in certified laboratory trials.',
    'Clean energy engineers have broken the 34% conversion efficiency threshold using advanced perovskite-silicon tandem cells. The breakthrough promises to double energy output per square meter compared to traditional silicon-only arrays.\n\nCommercial scale-up is already underway with pilot manufacturing lines scheduled to supply utility-scale solar farms by late 2027.',
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    'Technology',
    'CleanTech World',
    'David Miller',
    NOW() - INTERVAL '1 day'
),

-- Business
(
    'Global Central Banks Announce Coordinated Monetary Strategy',
    'Major economic institutions pivot toward stability policies amid shifting international trade corridors.',
    'Financial markets responded with positive momentum following a joint briefing by central bank governors across major global economies. The coordinated strategy focuses on inflation stabilization while expanding credit access for green infrastructure and technological research.\n\nMarket analysts noted a surge in green bonds and long-term equity confidence as volatility indices dropped to multi-year lows.',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    'Business',
    'Financial Times Express',
    'Marcus Thorne',
    NOW() - INTERVAL '2 hours'
),
(
    'Global Semiconductor Supply Chain Reaches Historic Surplus',
    'Increased fabrication capacity across continents stabilizes prices for consumer electronics and automotive chips.',
    'Following several years of aggressive investment in domestic semiconductor foundries, global chip supply has finally normalized. Automobile manufacturers and consumer hardware makers report zero component shortages for the first time in six years, triggering price cuts across smart devices and electric vehicles.',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80',
    'Business',
    'Bloomberg Report',
    'Rachel Sterling',
    NOW() - INTERVAL '5 hours'
),
(
    'Remote Work Infrastructure Market Surges Past $100 Billion',
    'Hybrid workforce tools continue strong growth as enterprise platforms integrate AI collaboration tools.',
    'Enterprise software spending on asynchronous collaboration platforms and digital whiteboards hit a record high this quarter. Companies are heavily investing in virtual presence and continuous security architecture to support permanently distributed teams.',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    'Business',
    'Wall Street Journal Focus',
    'Jonathan Blake',
    NOW() - INTERVAL '2 days'
),

-- Politics
(
    'International Climate Summit Reaches Historic Carbon Agreement',
    'Delegates from 140 nations sign legally binding accord to phase out fossil fuel subsidies by 2030.',
    'Following intense negotiations lasting through the night, world leaders finalized the landmark 2030 Energy Transition Treaty. The treaty mandates strict emission caps and creates a multi-billion dollar fund to assist developing nations in building renewable grids.\n\nEnvironmental advocates praised the binding nature of the agreement, while energy sector representatives called for clear transition timetables.',
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    'Politics',
    'Global Politics Review',
    'Amira Patel',
    NOW() - INTERVAL '4 hours'
),
(
    'National Infrastructure Reform Bill Passes Senate with Bipartisan Majority',
    'Comprehensive legislation allocates funds for high-speed rail, modernized power grids, and rural broadband access.',
    'In a rare display of legislative consensus, the Senate approved the $850 billion Infrastructure Modernization Act. Key provisions include upgrading electrical transmission networks, expanding passenger rail corridors, and ensuring universal high-speed internet access across rural communities.',
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1200&q=80',
    'Politics',
    'Capitol Hill Wire',
    'Robert Hayes',
    NOW() - INTERVAL '6 hours'
),

-- Sports
(
    'Underdog Squad Wins World Football Championship in Stunning Final',
    'A stoppage-time goal secures an unforgettable 3-2 victory in one of the most thrilling finals in tournament history.',
    'In an extraordinary display of tactical discipline and grit, the underdog squad emerged victorious in the final seconds of extra time. Fans erupted across the stadium as striker Lucas Silva headed home the winning goal in the 94th minute.\n\n"We never stopped believing," said team captain Mateo Rossi during the trophy presentation. "This victory belongs to everyone who supported us through the hardest training sessions."',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    'Sports',
    'Sports Illustrated Today',
    'Carlos Mendez',
    NOW() - INTERVAL '30 minutes'
),
(
    'Grand Prix Final: Young Prodigy Breaks Lap Speed Record',
    '19-year-old racing sensation claims maiden victory with flawless driving in rainy conditions.',
    'In treacherous weather conditions that forced three safety car periods, teenage sensation Maya Lin drove a masterclass race to capture her first Grand Prix victory. Her daring overtake on turn 4 will go down as one of the finest moves of the modern motor racing era.',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    'Sports',
    'Motorsport Daily',
    'Liam O\'Connor',
    NOW() - INTERVAL '8 hours'
),

-- Entertainment
(
    'Indie Sci-Fi Film Sweeps Major Awards at Cannes Film Festival',
    'Visual masterpiece shot on IMAX cameras captivates critics and audiences alike.',
    'Director Sophia Laurent\'s visionary sci-fi epic took home the top honor at this year\'s festival. Featuring groundbreaking practical special effects and a haunting ambient soundtrack, the film was hailed by critics as a milestone in cinematic storytelling.',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    'Entertainment',
    'Cinema Scope Weekly',
    'Claire Montgomery',
    NOW() - INTERVAL '12 hours'
),
(
    'Global Music Festival Attracts Over 500,000 Attendees',
    'Three-day event features unforgettable performances, holographic stages, and immersive light displays.',
    'The annual Harmony World Music Festival concluded last night with a spectacular finale featuring legendary headliners and surprise acoustic duets. Organizers highlighted the festival\'s zero-waste sustainability initiatives alongside its record-breaking attendance.',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    'Entertainment',
    'Music Beat',
    'Julian Vance',
    NOW() - INTERVAL '1 day'
),

-- Education
(
    'Universities Launch Open AI Literacy Curriculum Worldwide',
    'Global coalition of educational institutions offers free online certification in artificial intelligence ethics and tools.',
    'A coalition of top global universities has launched an open-access AI literacy initiative aimed at secondary students and working professionals. The program covers machine learning fundamentals, data privacy laws, algorithmic bias evaluation, and prompt engineering.',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    'Education',
    'Higher Ed Journal',
    'Dr. Aris Thorne',
    NOW() - INTERVAL '10 hours'
),
(
    'Interactive Science Museums Report Surge in STEM Workshop Enrollment',
    'Hands-on robotics and space exploration modules inspire the next generation of young scientists.',
    'Enrollment in youth science and technology programs has doubled over the past year. Educators attribute the surge to newly updated interactive exhibits that blend augmented reality with real-world engineering challenges.',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
    'Education',
    'EduPulse',
    'Samantha Reed',
    NOW() - INTERVAL '1 day'
);
