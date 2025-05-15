declare module 'hdkey' {
  class HDKey {
    static fromMasterSeed(seed: Buffer): HDKey;
    derive(path: string): HDKey;
    privateKey: Buffer;
    publicKey: Buffer;
  }
  export default HDKey;
}