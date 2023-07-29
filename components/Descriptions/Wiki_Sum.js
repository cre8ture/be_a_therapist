import React, { useState, useEffect } from 'react';

const WikiLink = ({ term }) => {
  const [summary, setSummary] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const fetchSummary = async () => {
      setOpacity(0);
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          term
        )}`
      );
      const data = await response.json();
      if (
        data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found'
      ) {
        // handle case where Wikipedia page does not exist
        setSummary('Wikipedia page not found');
        setUrl('');
        setImageUrl('');
      } else if (
        data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/no_extract'
      ) {
        // handle case where Wikipedia page exists but there is no summary available
        setSummary('No summary available');
        setUrl(data.content_urls.desktop.page);
        setImageUrl('');
      } else {
        // handle case where Wikipedia page exists and there is a summary available
        setSummary(data.extract);
        setUrl(data.content_urls.desktop.page);
        if (data.originalimage && data.originalimage.source) {
          setImageUrl(data.originalimage.source);
        } else {
          setImageUrl('');
        }
      }
      // Update the opacity to trigger the transition when a new API response is loaded
      setOpacity(1);
    };

    if (term) {
      fetchSummary();
    }
  }, [term]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        marginLeft: '25px',
        marginRight: '30px',
        opacity: opacity,
        transition: 'opacity 1s',
      }}
    >
      <div style={{ flex: 1 }}>
        <p>{summary}</p>
        <a href={url}>Read more about {term}</a>
      </div>
      {imageUrl && (
        <div style={{ flex: 1, marginLeft: '25px', marginTop: '20px' }}>
          <img src={imageUrl} alt={term} style={{ maxWidth: '100%', maxHeight: '250px' }} />
        </div>
      )}
    </div>
  );
};

export default WikiLink;
