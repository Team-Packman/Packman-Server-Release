
export interface ICategory {
  name: string;
  listId: number;
}

export interface CategoryCreateDto {
  name: string;
  listId: number;
}

// export interface CategoryUpdateDto {
//   id: mongoose.Types.ObjectId;
//   name: string;
//   listId: mongoose.Types.ObjectId;
// }

// export interface CategoryDeleteDto {
//   listId: mongoose.Types.ObjectId;
//   categoryId: mongoose.Types.ObjectId;
// }
