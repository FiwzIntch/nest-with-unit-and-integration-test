export interface Pagination<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItem: number;
    totalPage: number;
  };
}
