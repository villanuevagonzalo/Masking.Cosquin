import * as OBC from "@thatopen/components";
import * as FRAGS from "@thatopen/fragments";

export const initFragmentsManager = (components: OBC.Components): OBC.FragmentsManager => {

  const workerUrl = 'assets/fragments/worker.mjs';
  const fragments = components.get(OBC.FragmentsManager);
  fragments.init(workerUrl);

  return fragments;

};

export type ProgressCb = (progress: number, data: FRAGS.ProgressData) => void;

export const convertIFCArrayBuffertoFragmentBytes = async (
  serializer: FRAGS.IfcImporter,
  arrayBuffer: ArrayBuffer,
  progressCallback: ProgressCb = () => {},
): Promise<ArrayBuffer> => {
  const ifcBytes = new Uint8Array(arrayBuffer);
  const fragmentBytes = (
    await serializer.process({
      bytes: ifcBytes,
      progressCallback,
    })
  ).buffer as ArrayBuffer;

  return fragmentBytes;
};

export const convertIFCFiletoFragmentBytes = async ( serializer: FRAGS.IfcImporter, file: File ): Promise<ArrayBuffer> => {

  return convertIFCArrayBuffertoFragmentBytes(serializer, await file.arrayBuffer());

};

export const convertIFCPathtoFragmentBytes = async (
  serializer: FRAGS.IfcImporter,
  filePath: string,
  progressCallback: ProgressCb = () => {},
): Promise<ArrayBuffer> => {
  const ifcFile = await fetch(filePath);
  const ifcBuffer = await ifcFile.arrayBuffer();

  return convertIFCArrayBuffertoFragmentBytes(
    serializer,
    ifcBuffer,
    progressCallback,
  );
};
