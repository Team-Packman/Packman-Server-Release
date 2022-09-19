import { LandingUserResponseDto } from '../interfaces/ILanding';

const createLandingUser = async (
  client: any,
  phone: string,
): Promise<LandingUserResponseDto | string> => {
  try {
    const { rows: existPhone } = await client.query(
      `
        SELECT *
        FROM "landing_user" lu
        WHERE lu.phone = $1
      `,
      [phone],
    );

    if (existPhone.length) return 'duplicate_phone';

    await client.query('BEGIN');

    const { rows: landingUser } = await client.query(
      `
        INSERT INTO "landing_user" (phone)
        VALUES ($1)
        RETURNING id
      `,
      [phone],
    );

    const { rows: num } = await client.query(
      `
        SELECT COUNT(*) as num
        FROM "landing_user" lu
      `,
    );

    const data: LandingUserResponseDto = {
      id: landingUser[0].id.toString(),
      num: num[0].num,
    };

    await client.query('COMMIT');

    return data;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
};

export default {
  createLandingUser,
};
