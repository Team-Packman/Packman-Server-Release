import { AllFolderResponseDto, FolderInfoDto } from '../interfaces/IFolder';

async function folderResponse(client: any, userId: string): Promise<AllFolderResponseDto> {
  try {
    const { rows: folders } = await client.query(
      `
        SELECT  f.id::text,f.name, f.is_aloned AS "isAloned",COUNT(al.id) AS "listNum"
        FROM (
                SELECT * 
                FROM "folder" 
                WHERE user_id = $1
                ) AS f
        LEFT JOIN "folder_packing_list" as fl ON f.id = fl.folder_id
        LEFT JOIN "packing_list" as pl ON pl.id = fl.list_id AND pl.is_deleted = false
        LEFT JOIN "alone_packing_list" as al ON al.id = pl.id
        GROUP BY f.id, f.name, f.is_aloned
        ORDER BY f.id DESC
        `,
      [userId],
    );
    const aloneFolder = await folders.filter((folder: FolderInfoDto) => folder.isAloned === true)
                                      .map((filteredFolder: FolderInfoDto) => (
                                        {
                                          id: filteredFolder.id, 
                                          name: filteredFolder.name, 
                                          listNum: filteredFolder.listNum
                                        }
                                      ));
    const togetherFolder = await folders.filter((folder: FolderInfoDto) => folder.isAloned === false)
                                        .map((filteredFolder: FolderInfoDto) => (
                                          {
                                            id: filteredFolder.id, 
                                            name: filteredFolder.name, 
                                            listNum: filteredFolder.listNum
                                          }
                                        ));
    const folderResponse: AllFolderResponseDto = {
      aloneFolder: aloneFolder,
      togetherFolder: togetherFolder,
    };

    return folderResponse;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export { folderResponse };
