export interface Category {
  category_id: string
  key: string
  name: string
  path: string
  image: {
    data: string
    valid: boolean
  }
  child: {
    data: Category[] | null
    valid: boolean
  }
  parent?: string | null
}

export interface CategoryResponse {
  categories: Category[]
}

export interface CreateCategoryData {
  name: string
  parent?: string
  media: File[]
}

export interface UpdateCategoryData {
  name: string
  cate_id: string
  parent?: string
  media?: File[]
}
