import { useState, useEffect } from 'react';

const WikiLink = ({ term }) => {
  const [summary, setSummary] = useState('');
  const [url, setUrl] = useState('');

  console.log("TERM", term)

  useEffect(() => {

    const fetchSummary = async () => {
        const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`);
        const data = await response.json();
        if (data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found') {
          // handle case where Wikipedia page does not exist
          setSummary('Wikipedia page not found');
          setUrl('');
        } else if (data.type === 'https://mediawiki.org/wiki/HyperSwitch/errors/no_extract') {
          // handle case where Wikipedia page exists but there is no summary available
          setSummary('No summary available');
          setUrl(data.content_urls.desktop.page);
        } else {
          // handle case where Wikipedia page exists and there is a summary available
          setSummary(data.extract);
          setUrl(data.content_urls.desktop.page);
        }
      };
      

    if(term){
    fetchSummary();
    }
  }, [term]);

  return (
    <div style={{marginLeft:'12px', marginRight: '30px'}}>
      <p>{summary}</p>
      <a href={url}>Read more about {term}</a>
    </div>
  );
};

export default WikiLink;
