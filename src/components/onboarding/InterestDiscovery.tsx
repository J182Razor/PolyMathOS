import React, { useState } from 'react';

interface InterestDiscoveryProps {
  userData: any;
  onNext: (data: any) => void;
  onBack?: () => void;
}

const domains = [
  { id: 'machine-learning', name: 'Machine Learning', description: 'AI and statistical models', icon: 'psychology' },
  { id: 'quantum-physics', name: 'Quantum Physics', description: 'Study of matter and energy', icon: 'atm' },
  { id: 'abstract-algebra', name: 'Abstract Algebra', description: 'Study of algebraic structures', icon: 'function' },
  { id: 'neuroscience', name: 'Neuroscience', description: 'Study of the nervous system', icon: 'neurology' },
  { id: 'comp-biology', name: 'Comp. Biology', description: 'Models for biology', icon: 'biotech' },
  { id: 'cryptography', name: 'Cryptography', description: 'Secure communication', icon: 'lock' },
  { id: 'string-theory', name: 'String Theory', description: 'Framework in physics', icon: 'view_in_ar' },
  { id: 'bioinformatics', name: 'Bioinformatics', description: 'Analyzing biological data', icon: 'genetics' },
];

const InterestDiscovery: React.FC<InterestDiscoveryProps> = ({ userData, onNext, onBack }) => {
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleDomain = (domainId: string) => {
    setSelectedDomains(prev => 
      prev.includes(domainId) 
        ? prev.filter(id => id !== domainId)
        : [...prev, domainId]
    );
  };

  const filteredDomains = domains.filter(domain =>
    domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    domain.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden text-[#EAEAEA] bg-background-dark font-display">
      {/* Header */}
      <div className="flex items-center p-4 pb-2">
        <div className="flex size-12 shrink-0 items-center justify-start text-[#EAEAEA]">
          <button onClick={onBack} className="material-symbols-outlined text-2xl">arrow_back</button>
        </div>
        <h1 className="flex-1 text-center text-lg font-bold leading-tight tracking-[-0.015em] text-[#EAEAEA] mr-12">
          Craft Your Knowledge Core
        </h1>
      </div>

      {/* Subheader Text */}
      <p className="px-4 pb-3 pt-1 text-base font-normal leading-normal text-[#EAEAEA]/70">
        Choose one or more fields to begin your journey.
      </p>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <label className="flex h-12 w-full min-w-40 flex-col">
          <div className="flex h-full w-full flex-1 items-stretch rounded-lg">
            <div className="flex items-center justify-center rounded-l-lg border-r-0 border-none bg-[#1F1F2A] pl-4 text-[#EAEAEA]/70">
              <span className="material-symbols-outlined text-2xl">search</span>
            </div>
            <input
              className="form-input h-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none border-l-0 border-none bg-[#1F1F2A] px-4 pl-2 text-base font-normal leading-normal text-[#EAEAEA] placeholder:text-[#EAEAEA]/50 focus:outline-0 focus:ring-0"
              placeholder="Search for a domain"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </label>
      </div>

      {/* Domain Selection Grid */}
      <div className="grid flex-1 grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 p-4">
        {filteredDomains.map((domain) => {
          const isSelected = selectedDomains.includes(domain.id);
          return (
            <div
              key={domain.id}
              onClick={() => toggleDomain(domain.id)}
              className={`group flex cursor-pointer flex-1 flex-col gap-3 rounded-lg border ${
                isSelected ? 'border-2 border-primary bg-[#1F1F2A] ring-2 ring-primary/30' : 'border-[#3B3B4F] bg-[#1F1F2A] ring-2 ring-transparent'
              } p-4 transition-all hover:border-primary/50 hover:bg-[#1F1F2A]/80 focus-within:border-primary focus-within:ring-primary/30`}
            >
              <div className="flex items-center justify-between">
                <span className={`material-symbols-outlined text-2xl ${isSelected ? 'text-primary' : 'text-primary'}`}>
                  {domain.icon}
                </span>
                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  isSelected 
                    ? 'border-primary bg-primary' 
                    : 'border-[#3B3B4F] bg-transparent group-focus-within:border-primary group-focus-within:bg-primary'
                }`}>
                  <span className={`material-symbols-outlined text-sm text-background-dark ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-focus-within:opacity-100'
                  }`}>
                    check
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-bold leading-tight text-[#EAEAEA]">{domain.name}</h2>
                <p className="text-sm font-normal leading-normal text-[#EAEAEA]/70">{domain.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button */}
      <div className="sticky bottom-0 mt-auto w-full bg-gradient-to-t from-background-dark to-transparent p-4 pt-12">
        <button
          onClick={() => onNext({ ...userData, domains: selectedDomains })}
          disabled={selectedDomains.length === 0}
          className="flex h-14 w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full bg-primary pl-6 pr-5 text-base font-bold leading-normal tracking-[0.015em] text-background-dark shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="truncate">Continue</span>
          <span className="material-symbols-outlined text-2xl">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default InterestDiscovery;
