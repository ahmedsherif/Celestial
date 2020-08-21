interface SyndicationData {
	uid: string;
	name: string;
	service?: {
		name: string;
		url: string;
		photo: string;
	};
	user?: {
		name: string;
		url: string;
		photo: string;
	};
}

interface MicropubConfig extends Object {
	[index: string]: any;
	"media-endpoint"?: string;
	"syndicate-to"?: Array<SyndicationData>;
	categories?: Array<string>;
	"post-types"?: {
		type: string;
		name: string;
	};
}

interface MicropubSyndicationData extends Object {
	[index: string]: any;
	"syndicate-to": Array<SyndicationData>;
}

interface VocabularyItem {
	name: string;
	type: string;
	icon: string;
	endpoint: string;
}

interface VocabularyItems extends Array<VocabularyItem> {}

export {
	MicropubConfig,
	MicropubSyndicationData,
	VocabularyItems,
	VocabularyItem,
};
