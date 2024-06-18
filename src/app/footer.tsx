import React from 'react';

const Footer = () => {
  return (
    <footer style={{backgroundColor: '#f8f9fa', padding: '1rem', marginTop: '2rem', textAlign: 'center'}}>
      <p>Last updated: June 2024. Data is continuously updated.</p>
      <p>Data provided by the <a href="https://docs.opendota.com/" target='_blank' rel="noopener noreferrer">OpenDota API</a>.</p>
    </footer>
  );
};

export default Footer;