async function folderCheckResponse(
  client: any,
  userId: number,
  folderId: string,
  isAloned: boolean,
): Promise<string> {
  try {
    const { rows: existFolder } = await client.query(
      `
        SELECT *
        FROM "folder"
        WHERE id=$1 AND is_aloned=${isAloned} AND folder.user_id=$2
      `,
      [folderId, userId],
    );
    if (existFolder.length === 0) return 'no_folder';

    return 'ok';
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export { folderCheckResponse };
