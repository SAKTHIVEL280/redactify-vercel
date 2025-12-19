import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const AdSenseSlot = ({ slot, format = 'auto', style = {} }) => {
  useEffect(() => {
    // Check if user has accepted advertising cookies
    const cookiePrefs = localStorage.getItem('cookie_preferences');
    if (cookiePrefs) {
      const prefs = JSON.parse(cookiePrefs);
      if (!prefs.adsense) {
        return; // Don't load AdSense if user rejected
      }
    }

    try {
      if (window.adsbygoogle && !window.adsbygoogle.loaded) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', ...style }}
      data-ad-client={import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX'}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
};

AdSenseSlot.propTypes = {
  slot: PropTypes.string.isRequired,
  format: PropTypes.string,
  style: PropTypes.object,
};

export default AdSenseSlot;
