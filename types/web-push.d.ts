declare module "web-push" {
  interface VapidKeys {
    publicKey: string;
    privateKey: string;
  }
  function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  function generateVAPIDKeys(): VapidKeys;
  function sendNotification(
    subscription: { endpoint: string; keys: Partial<{ p256dh: string; auth: string }> },
    payload?: string,
    options?: Record<string, unknown>
  ): Promise<unknown>;
  const webpush: {
    setVapidDetails: typeof setVapidDetails;
    generateVAPIDKeys: typeof generateVAPIDKeys;
    sendNotification: typeof sendNotification;
  };
  export default webpush;
}
