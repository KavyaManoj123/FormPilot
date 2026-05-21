'use client';

import BuilderCanvas from './builder-canvas';
import BuilderSidebar from './builder-sidebar';
import FieldSettings from './field-settings';
import FormHeader from './form-header';
import { useFormBuilder } from './hooks/use-form-builder';
import { FormRecord } from './types';

interface FormBuilderScreenProps {
  initialForm?: FormRecord;
}

export default function FormBuilderScreen({
  initialForm,
}: FormBuilderScreenProps) {
  const builder = useFormBuilder(initialForm);

  return (
    <div className="-m-6 flex h-[calc(100vh-80px)] flex-col overflow-hidden bg-[#111111] text-white">
      <FormHeader builder={builder} />

      <div className="flex flex-1 overflow-hidden">
        <BuilderSidebar builder={builder} />
        <BuilderCanvas builder={builder} />
        <FieldSettings builder={builder} />
      </div>
    </div>
  );
}
