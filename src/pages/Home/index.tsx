import React, { useEffect, useRef } from 'react';
import { Scene } from '@antv/l7';
import { PointLayer } from '@antv/l7-layers';
import * as XLSX from 'xlsx';
import L7Map from '@/components/L7Map';

const Home = () => {
  return (
    <div>
      <L7Map></L7Map>
    </div>
  );
};

export default Home;
