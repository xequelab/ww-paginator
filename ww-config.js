export default {
    editor: {
        label: {
            en: 'Paginator',
            fr: 'Paginateur',
        },
        icon: 'dots-horizontal',
        bubble: {
            icon: 'dots-horizontal',
        },
    },
    triggerEvents: [
        {
            name: 'change',
            label: { en: 'On page change' },
            event: {
                context: {
                    page: 0,
                    offset: 0,
                    limit: 0,
                    total: 0,
                },
            },
        },
        {
            name: 'limitChange',
            label: { en: 'On items per page change' },
            event: {
                context: {
                    page: 0,
                    offset: 0,
                    limit: 0,
                    total: 0,
                },
            },
        },
    ],
    properties: {
        // === GENERAL SETTINGS ===
        useCustomPagination: {
            label: {
                en: 'Custom pagination',
                fr: 'Pagination personnalisée',
            },
            type: 'OnOff',
            section: 'settings',
            defaultValue: false,
        },
        collectionId: {
            hidden: content => content.useCustomPagination,
            label: {
                en: 'Collection',
                fr: 'Collection',
            },
            type: 'Collection',
            section: 'settings',
            options: {
                paginated: true,
            },
            defaultValue: null,
        },

        // === CUSTOM PAGINATION VALUES ===
        paginatorTotal: {
            hidden: content => !content.useCustomPagination,
            label: { en: 'Total items', fr: 'Total items' },
            type: 'Number',
            section: 'settings',
            defaultValue: 100,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'number',
                tooltip: 'A number that defines the paginator total items: `100`',
            },
            /* wwEditor:end */
        },
        paginatorLimit: {
            hidden: content => !content.useCustomPagination,
            label: { en: 'Items per page', fr: 'Items per page' },
            type: 'Number',
            section: 'settings',
            defaultValue: 10,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'number',
                tooltip: 'A number that defines the paginator items per page: `10`',
            },
            /* wwEditor:end */
        },
        paginatorOffset: {
            hidden: content => !content.useCustomPagination,
            label: { en: 'Offset', fr: 'Offset' },
            type: 'Number',
            section: 'settings',
            defaultValue: 0,
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'number',
                tooltip: 'A number that defines the paginator offset: `0`',
            },
            /* wwEditor:end */
        },

        // === DISPLAY OPTIONS ===
        maxVisiblePages: {
            label: {
                en: 'Max visible pages',
                fr: 'Pages visibles max',
            },
            type: 'Number',
            section: 'settings',
            defaultValue: 5,
            options: {
                min: 3,
                max: 10,
            },
            /* wwEditor:start */
            propertyHelp: {
                tooltip: 'Maximum number of page buttons to display (including separators)',
            },
            /* wwEditor:end */
        },

        // === ITEMS PER PAGE SELECTOR ===
        showItemsPerPageSelector: {
            label: {
                en: 'Show items per page selector',
                fr: 'Afficher sélecteur items par page',
            },
            type: 'OnOff',
            section: 'settings',
            defaultValue: true,
        },
        itemsPerPageLabel: {
            hidden: content => !content.showItemsPerPageSelector,
            label: {
                en: 'Items per page label',
                fr: 'Label items par page',
            },
            type: 'Text',
            section: 'settings',
            defaultValue: 'Items per page:',
            bindable: true,
            multiLang: true,
        },
        itemsPerPageOptions: {
            hidden: content => !content.showItemsPerPageSelector,
            label: {
                en: 'Items per page options',
                fr: 'Options items par page',
            },
            type: 'Array',
            section: 'settings',
            options: {
                item: {
                    type: 'Number',
                    defaultValue: 10,
                },
            },
            defaultValue: [5, 10, 25, 50, 100],
            bindable: true,
            /* wwEditor:start */
            bindingValidation: {
                type: 'array',
                tooltip: 'Array of numbers for items per page options: `[5, 10, 25, 50]`',
            },
            /* wwEditor:end */
        },

        // === INFO TEXT ===
        showInfoText: {
            label: {
                en: 'Show info text',
                fr: 'Afficher texte info',
            },
            type: 'OnOff',
            section: 'settings',
            defaultValue: true,
        },


        // === LAYOUT STYLES ===
        gap: {
            label: { en: 'Gap between elements' },
            type: 'Length',
            section: 'style',
            defaultValue: '16px',
            options: {
                unitChoices: [{ value: 'px', label: 'px', min: 0, max: 50 }],
            },
        },

        // === BUTTON STYLES ===
        buttonPadding: {
            label: { en: 'Button padding' },
            type: 'Length',
            section: 'style',
            defaultValue: '8px 12px',
        },
        borderRadius: {
            label: { en: 'Border radius' },
            type: 'Length',
            section: 'style',
            defaultValue: '6px',
            options: {
                unitChoices: [{ value: 'px', label: 'px', min: 0, max: 50 }],
            },
        },
        buttonFontSize: {
            label: { en: 'Button font size' },
            type: 'Length',
            section: 'style',
            defaultValue: '14px',
            responsive: true,
            options: {
                unitChoices: [{ value: 'px', label: 'px', min: 10, max: 24 }],
            },
        },

        // === BUTTON COLORS (NORMAL STATE) ===
        buttonBackground: {
            label: { en: 'Button background' },
            type: 'Color',
            section: 'style',
            defaultValue: '#ffffff',
            options: {
                nullable: true,
            },
        },
        buttonColor: {
            label: { en: 'Button text color' },
            type: 'Color',
            section: 'style',
            defaultValue: '#374151',
            options: {
                nullable: true,
            },
        },
        buttonBorder: {
            label: { en: 'Button border color' },
            type: 'Color',
            section: 'style',
            defaultValue: '#d1d5db',
            options: {
                nullable: true,
            },
        },

        // === BUTTON COLORS (ACTIVE STATE) ===
        activeButtonBackground: {
            label: { en: 'Active button background' },
            type: 'Color',
            section: 'style',
            defaultValue: '#3b82f6',
            options: {
                nullable: true,
            },
        },
        activeButtonColor: {
            label: { en: 'Active button text color' },
            type: 'Color',
            section: 'style',
            defaultValue: '#ffffff',
            options: {
                nullable: true,
            },
        },
        activeButtonBorder: {
            label: { en: 'Active button border color' },
            type: 'Color',
            section: 'style',
            defaultValue: '#3b82f6',
            options: {
                nullable: true,
            },
        },

        // === SELECTOR STYLES ===
        selectorBackground: {
            hidden: content => !content.showItemsPerPageSelector,
            label: { en: 'Selector background' },
            type: 'Color',
            section: 'style',
            defaultValue: '#ffffff',
            options: {
                nullable: true,
            },
        },
        selectorColor: {
            hidden: content => !content.showItemsPerPageSelector,
            label: { en: 'Selector text color' },
            type: 'Color',
            section: 'style',
            defaultValue: '#374151',
            options: {
                nullable: true,
            },
        },
        selectorBorder: {
            hidden: content => !content.showItemsPerPageSelector,
            label: { en: 'Selector border color' },
            type: 'Color',
            section: 'style',
            defaultValue: '#d1d5db',
            options: {
                nullable: true,
            },
        },
        selectorFontSize: {
            hidden: content => !content.showItemsPerPageSelector,
            label: { en: 'Selector font size' },
            type: 'Length',
            section: 'style',
            defaultValue: '14px',
            responsive: true,
            options: {
                unitChoices: [{ value: 'px', label: 'px', min: 10, max: 20 }],
            },
        },

        // === INFO TEXT STYLES ===
        infoTextColor: {
            hidden: content => !content.showInfoText,
            label: { en: 'Info text color' },
            type: 'Color',
            section: 'style',
            defaultValue: '#6b7280',
            options: {
                nullable: true,
            },
        },
        infoTextFontSize: {
            hidden: content => !content.showInfoText,
            label: { en: 'Info text font size' },
            type: 'Length',
            section: 'style',
            defaultValue: '14px',
            responsive: true,
            options: {
                unitChoices: [{ value: 'px', label: 'px', min: 10, max: 20 }],
            },
        },
    },
};
