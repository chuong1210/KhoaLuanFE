export interface Category {
  category_id: string
  key: string
  name: string
  path: string
  image: string | null
  child: Category[] | null
  parent?: string | null
}

export interface CategoryResponse {
  data: Category[]
}

export interface CreateCategoryData {
  parent?: string
  media: File
}

export interface UpdateCategoryData {
  cate_id: string
  media: File
}
