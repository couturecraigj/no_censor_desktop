import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ipcRenderer } from 'electron';
import styled from 'styled-components';
// eslint-disable-next-line import/no-unresolved

const Label = styled.label`
  background-color: #555;
  border-radius: 0.5em;
  padding: 1em;
`;

const getImageSize = file =>
  new Promise(resolve => {
    if (!file.type.includes('image')) return resolve({});

    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        // eslint-disable-next-line
        console.log('LOADED Image');
        resolve({ width: img.width, height: img.height });
      };

      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const onChange = async event => {
  event.preventDefault();
  // eslint-disable-next-line no-console
  console.log(event.target.files);

  for (const file of event.target.files) {
    const { width, height } = await getImageSize(file);

    ipcRenderer.send('onfilechange', {
      path: file.path,
      name: file.name,
      size: file.size,
      mimeType: file.type,
      height,
      width
    });
  }
};
const onDrop = event => {
  event.preventDefault();
  ipcRenderer.send('ondragstart', event.dataTransfer.files);

  return false;
  // eslint-disable-next-line no-console
  // console.log(event);
  // ipcRenderer.send("ondragstart", "details");
};
const handleCancel = () => {
  return false;
};

const Home = () => (
  <div>
    <h1>Home</h1>
    <div>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <Label>
        <input
          hidden
          name="Photo"
          type="file"
          onDrop={onDrop}
          onDragLeave={handleCancel}
          onDragOver={handleCancel}
          onDragEnd={handleCancel}
          onChange={onChange}
        />
        Drag Image
      </Label>
    </div>
  </div>
);

export default Home;
