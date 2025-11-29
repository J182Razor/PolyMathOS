import React, { useState } from 'react';
import { ResearchService } from '../services/ResearchService';
import { DocumentService } from '../services/DocumentService';

const ResourceLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'datasets' | 'courses' | 'papers' | 'government'>('datasets');
  const [searchTerm, setSearchTerm] = useState('');
  const researchService = new ResearchService();
  const documentService = new DocumentService();

  const tabs = [
    { id: 'datasets', label: 'Datasets' },
    { id: 'courses', label: 'Courses' },
    { id: 'papers', label: 'Papers' },
    { id: 'government', label: 'Gov Data' },
  ];

  const resources = [
    {
      id: 1,
      name: 'Quantum Entanglement Simulation',
      description: 'Dataset from MIT Media Lab',
      tags: ['#Quantum', '#Physics'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe71YDghcCRMN6-Z2JhRJYcifN0S6qkXPSGKf14Q6WjfjQUsnc5aQAzAVPDkgYHNXLQ_eIStUJ_8dWrrS7tVW0Y40o0VMwG2Mn-Q8eWTyodh4gycQzSJKV1CCMDWEayaYaKZ4pgS0Otko8bLTOWwgBCqvrWTiS_Mw6wHEaKpAvSlaTVtO2XxKKe8x4qrvz5NSwqen51WZYVyk4CyFrR_UFyeTcTGYVJc-9shg2ksvUvsQdKzgWjGwCkS1oXMoDBwCGb3dt_4RD8Jed',
    },
    {
      id: 2,
      name: 'Advanced AI Ethics Course',
      description: '12 Modules, Stanford University',
      tags: ['#Ethics', '#AI'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCW8gbj8wMZY7NTVAQBX3uqh_XAgcF9zCADGAxyq8GVshUEbWO2K6DVGjVOLswfvtYqM-_R2SPxp1f7xZwBlavuFML3nt0jN6PYYUOFhusve6RKxk89VYZLtTRbTQPTLjbqdXq3216R8Uo59hroNKuFBKciPetn3Du12sE_OVuMz67VGPf_qhOCzetWhGqLrUTAjJpsfhYOiYE7bqS3rxI9UTQrpfcBarEqrjxY-Tdt__vCiqEzVcMmaXF7Wn353v2_-oOmZALp_wCQ',
    },
    {
      id: 3,
      name: 'Superposition & Its Applications',
      description: 'Research paper by A. Turing',
      tags: ['#Quantum', '#Theory'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAA2I6tUoe8gVF-W12UnSVCSPMNjyIQIOCTe2vEJBkT_AIAmb6a8FbnpiD6R0fIImDbglKL5mbqk7N-02fBOW2W1g5Enjtz7q2-nQTChz0oAFDGOQ74DlHXFrmJbx8BUcqxicD9mQfD-bJK68m3YDL3lNugxcOvvQPb1Y961PvJfFGiWYX3OBZ7_psKuzDeajWcBCpXTEbbPqwKmbRLUflWVPoe5uMILICYc2jiQclb5xmRCJ-kK8va-n1Tgy9SAnkJ-dCmQ40NfIfz',
    },
    {
      id: 4,
      name: 'US Gov AI Research Archive',
      description: '1.2M Entries, Updated Q2 2024',
      tags: ['#GovData', '#AI'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDladE6rEKNFnnTJt2xanszuIqzi_QM7bp6MnwYSGYsAwVphIpGCZf6x8O4y1ejiTuSlqyXkrMRDjFmPBhFPG3GHr9eC0OLvkylPhEN1Dk7XgPOZUR7JCuuaopLtMHTavJmiVhKUJhU5_buT5kjfQiO0rColNGh-bXBLEQZJUT__8tQgpcOzgXv4PC-yfZzCU5vpKENswRhvWdsShZ94z9r530u6Nb5G2H3l4rvWbgN-GupMvWa7QZ4SDqKB6Q_DDcIp4jLXtoUdkSL',
    },
    {
      id: 5,
      name: 'Machine Learning Foundations',
      description: 'Deeplearning.ai Course',
      tags: ['#ML', '#Course'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBOMygje8UHja2ZGFbOCx1wVmtxGf9eIaTr6L8txXxCHvSBp_d7QjsBNuhHP0OAYs0PEEEXNT_mY4C0Pu4DHCkZC9xXTlIq5gRIKWurAD1iN_0wYVG9kbGYj9wZ8aOVIN91gPAWVHklRi_2kH7gm44ojN3CDZKHssf4jAa2yr10CtVJA8gLsJ_9_9JKbmG4035mzRyKMxPI_SatxMKR71lXIv8axkRfkCmX7XHZHuhXLn3IoMZEvcow0PxvGi2k3jPX3rBI112zscmz',
    },
    {
      id: 6,
      name: 'Modern Cryptography Protocols',
      description: 'Paper from ACM Conference',
      tags: ['#Cryptography', '#Security'],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2b2SqyEyskn3uxCGyNz8fTnDkPLAzG97WAe3qTs-ilhl6uWxG_lFfgxQnxbGTlWCpf229dJxCBFkB_FDb8P88qXKSjCoWbj1NwOoAF6f8O1Pgxq0uE6CiLu6ST9aF7qeKHCfsFrrLJnAZen5ahAhHLGQwWNc0C_azZYh6UkS2bh2ivyDjGl7TcoyhCp2gjTSSUYCj5rn1C3yUNiPBzjlJKqFPrW9Qu5_ol8vwkcwfXHF7BpalfH8NoqV2boQwo83AMCDohNdj2KtM',
    },
  ];

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display">
      {/* Top App Bar */}
      <div className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-text-primary-dark" style={{ fontSize: '28px' }}>
            widgets
          </span>
        </div>
        <h1 className="text-text-primary-dark text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Resource Library
        </h1>
        <div className="flex w-12 items-center justify-end">
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-text-primary-dark gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
            <span className="material-symbols-outlined text-text-primary-dark" style={{ fontSize: '28px' }}>
              account_circle
            </span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-text-secondary-dark flex border-none bg-card-dark items-center justify-center pl-4 rounded-l-lg border-r-0">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary-dark focus:outline-0 focus:ring-0 border-none bg-card-dark focus:border-none h-full placeholder:text-text-secondary-dark px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              placeholder="Search Quantum Datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </label>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-[#242424] px-4 justify-between">
          {tabs.map((tab) => (
            <a
              key={tab.id}
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(tab.id as any);
              }}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 flex-1 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-b-accent-dark text-accent-dark'
                  : 'border-b-transparent text-text-secondary-dark'
              }`}
              href="#"
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">{tab.label}</p>
            </a>
          ))}
        </div>
      </div>

      {/* Chips / Filters */}
      <div className="flex gap-3 px-4 py-3 overflow-x-auto [scrollbar-width:none]">
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-accent-dark/20 px-3">
          <span className="material-symbols-outlined text-accent-dark" style={{ fontSize: '20px' }}>
            tune
          </span>
          <p className="text-accent-dark text-sm font-medium leading-normal">Filter</p>
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-card-dark px-3">
          <p className="text-text-primary-dark text-sm font-medium leading-normal">Quantum Mechanics</p>
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-card-dark px-3">
          <p className="text-text-primary-dark text-sm font-medium leading-normal">AI Ethics</p>
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-card-dark px-3">
          <p className="text-text-primary-dark text-sm font-medium leading-normal">Cryptography</p>
        </button>
        <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-card-dark px-3">
          <p className="text-text-primary-dark text-sm font-medium leading-normal">AI Policy</p>
        </button>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-4 p-4">
        {filteredResources.map((resource) => (
          <div key={resource.id} className="flex flex-col gap-3 rounded-xl bg-card-dark p-3">
            <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-lg relative" style={{ backgroundImage: `url("${resource.image}")` }}>
              <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                <span className="material-symbols-outlined text-text-primary-dark" style={{ fontSize: '16px' }}>
                  open_in_new
                </span>
              </div>
            </div>
            <div>
              <p className="text-text-primary-dark text-base font-medium leading-normal">{resource.name}</p>
              <p className="text-text-secondary-dark text-sm font-normal leading-tight mt-1">{resource.description}</p>
              <p className="text-text-secondary-dark text-xs font-normal leading-normal mt-1.5">{resource.tags.join(', ')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceLibrary;
