import { ENTITIES } from '~constants';
import { SYNC_SETTING } from '~constants/Setting';
import { DatabaseService } from '~services/Database';

export const migration0_3_0 = {
  // This migration performs the following:
  // - Updates the SYNC URL based on the old 4 URL format
  migrate: async (dbService: DatabaseService): Promise<void> => {
    const serverURL = await dbService.get(ENTITIES.SETTING, { key: SYNC_SETTING.SERVER_URL });

    // If we already have a server URL, we don't need to do anything
    if (serverURL) return;

    // get the old auth URL to migrate from
    const oldAuthURL = await dbService.get(ENTITIES.SETTING, { key: 'authUrl' });

    // If there was no auth URL, we can't do anything!
    if (!oldAuthURL?.value) return;

    // Auth Url had a format something like this:
    // http://server.msupply.foundation:8080/coldchain/v1/login',
    // We need to remove the /coldchain/v1/login part

    try {
      const newServerURL = oldAuthURL.value.replace('/coldchain/v1/login', '');

      await dbService.upsert(ENTITIES.SETTING, {
        id: SYNC_SETTING.SERVER_URL,
        key: SYNC_SETTING.SERVER_URL,
        value: newServerURL,
      });
    } catch (e) {
      console.warn(`Unable to migrate: ${(e as Error).message}`);
    }
  },
};
