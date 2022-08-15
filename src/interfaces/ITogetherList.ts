export interface TogetherListCreateDto {
  departureDate: string;
  folderId: string;
  title: string;
  templateId: string;
}

export interface TogetherListResponseDto {
  id: string;
  title: string;
  departureDate: string;
  togetherPackingList: {
    id: string;
    groupId: string;
    category: {
      id: string;
      name: string;
      pack: {
        id: string;
        name: string;
        isChecked: boolean;
        packer: {
          id: string;
          nickname: string;
        } | null;
      }[];
    }[];
    inviteCode: string;
    isSaved: boolean;
  };
  myPackingList: {
    id: string;
    category: {
      id: string;
      name: string;
      pack: {
        id: string;
        name: string;
        isChecked: boolean;
        packer: null;
      }[];
    }[];
  };
}
