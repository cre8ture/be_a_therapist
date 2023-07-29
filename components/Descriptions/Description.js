import React, { useState, useEffect } from 'react';

const Description = () => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // After the component mounts, set the opacity to 1 with a delay of 50ms to trigger the animation
    setTimeout(() => setOpacity(1), 50);
  }, []);

  return (
    <div style={{ margin: '3px', padding: '10px', opacity, transition: 'opacity 1s' }}>
      <h2>Try a Therapy Style</h2>
      <p>Talk to a therapist legend, from Freud, Perls to Woodruff or Erickson</p>
      <p>
        This is an experiment to explore how LLMs like ChatGPT work. Please do not share any
        confidential information and do not use this for therapy. Rather, you might find a style
        of discourse you like and continue researching more from there
      </p>

      {/* <a href="https://www.wikipedia.org/">More about Motivational Interviewing</a> */}
    </div>
  );
};

export default Description;
