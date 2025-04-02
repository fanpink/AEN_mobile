import React from 'react';
import SubComponent1 from './SeismicBulletin/SubComponent1';
import SubComponent2 from './SeismicBulletin/SubComponent2';

// 震情通报
function SeismicBulletin() {
  return (
    <div>
      <h1>震情通报</h1>
      <SubComponent1 />
      <SubComponent2 />
    </div>
  );
}

export default SeismicBulletin;