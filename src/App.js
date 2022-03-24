import React, { useCallback, useState, useMemo } from "react";
import { RichTextEditor } from '@mantine/rte';
const App = () => {
  const initialValue =
  '<p>Your initial <b>html value</b> or an empty string to init editor without value</p>'
  const [value, onChange] = useState(initialValue);
  const modules = useMemo(
    () => ({
      history: { delay: 2500, userOnly: true },
      syntax: true,
    }),
    []
  );
  console.log(value)
  return (
    <>
    
    <RichTextEditor modules={modules} value={value} onChange={onChange} />
    
    </>
  )
}
export default App;
