'use client'; // Make sure this is the first line in the file
import React, { useState } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import InfoCardsSection from './components/InfoCardsSection';
import ActivitySection from './components/ActivitySection';
import TechnologySection from './components/TechnologySection';
import RegistrationSection from './components/RegistrationSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import SmartContractComponent from '../SmartContract/SmartContractData';

export default function LandingPage() {
    const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

    const handleRegistrationClick = () => {
        setIsRegistrationOpen(true); // Open registration modal
    };

    const handleCloseRegistration = () => {
        setIsRegistrationOpen(false); // Close registration modal
    };

    return (
        <div className="App">
           <Header onRegistrationClick={handleRegistrationClick} /> 
            <SmartContractComponent />
    
            {/* Conditionally render the registration section */}
            {isRegistrationOpen && (
                <RegistrationSection onClose={handleCloseRegistration} />
            )}
            
            <HeroSection />
            <ActivitySection />
            <TechnologySection />
            <InfoCardsSection />
            <FAQSection />
            <Footer />
        </div>
    );
}
