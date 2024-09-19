export interface Publisher {
  name: string;
  url: string;
  favicon: string;
}

export interface NewsData {
  title: string;
  url: string;
  excerpt: string;
  thumbnail: string;
  language: string;
  paywall: boolean;
  contentLength: number;
  date: string;
  authors: string[];
  keywords: any[];
  publisher: Publisher;
}

export interface NewsResponse {
  success: boolean;
  data: NewsData[];
}
