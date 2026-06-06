import React from 'react';
import TriggerList from '@/pages/Scheduling/components/TriggerList';
import {Entity} from '@/types/data-modeling';

interface TriggerWrapperProps {
  model: Entity;
}

const TriggerWrapper: React.FC<TriggerWrapperProps> = ({ model }) => {
  return (
    <TriggerList
      model={model}
      eventOnly={true}
    />
  );
};

export default TriggerWrapper;
