export interface Blog {
	_id: string;
	category: string;
	image: string;
	bannerImg: string;
	title: string;
	description: string;
	content: string;
	author: string;
	publishDate: string;
	tags: string[];
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateBlogInput {
	category: string;
	image: string;
	bannerImg: string;
	title: string;
	description: string;
	content: string;
	author: string;
	publishDate: string;
	tags: string[];
}

export interface UpdateBlogInput extends Partial<CreateBlogInput> {
	_id: string;
}
