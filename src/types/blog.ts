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
	isApproved?: boolean;
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
	isApproved?: boolean;
}

export interface UpdateBlogInput extends Partial<CreateBlogInput> {
	_id: string;
}
