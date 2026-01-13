<template>
    <div class="ww-paginator-wrapper" :style="containerStyle">
        <!-- Items per page selector -->
        <div v-if="content.showItemsPerPageSelector" class="items-per-page-selector">
            <span class="selector-label">{{ itemsPerPageLabel }}</span>
            <select
                v-model="selectedLimit"
                @change="handleLimitChange"
                :disabled="isEditing"
                class="selector-dropdown"
                :style="selectorStyle"
            >
                <option v-for="option in limitOptions" :key="option" :value="option">
                    {{ option }}
                </option>
            </select>
        </div>

        <!-- Pagination controls -->
        <nav class="ww-paginator" role="navigation">
            <!-- Previous button -->
            <button
                class="pagination-button pagination-arrow"
                :class="{ disabled: currentPage === 0 }"
                :disabled="currentPage === 0 || isEditing"
                @click="prev"
                :style="buttonStyle"
                aria-label="Previous page"
            >
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 1L1 7L7 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>

            <!-- Page numbers -->
            <button
                v-for="(nav, index) in navigation"
                :key="index"
                :class="[
                    'pagination-button',
                    'pagination-number',
                    { active: nav.index === currentPage, separator: nav.index === -1 }
                ]"
                :disabled="nav.index === -1 || isEditing"
                @click="goTo(nav.index)"
                :style="nav.index === currentPage ? activeButtonStyle : buttonStyle"
                :aria-current="nav.index === currentPage ? 'page' : undefined"
                :aria-label="nav.index === -1 ? undefined : `Go to page ${nav.index + 1}`"
            >
                {{ nav.label }}
            </button>

            <!-- Next button -->
            <button
                class="pagination-button pagination-arrow"
                :class="{ disabled: currentPage === nbPage - 1 }"
                :disabled="currentPage === nbPage - 1 || isEditing"
                @click="next"
                :style="buttonStyle"
                aria-label="Next page"
            >
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L7 7L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        </nav>

        <!-- Info text -->
        <div v-if="content.showInfoText" class="pagination-info" :style="infoTextStyle">
            {{ paginationInfoText }}
        </div>
    </div>
</template>

<script>
import { computed, ref, watch } from 'vue';

export default {
    name: 'WwPaginator',
    props: {
        content: {
            type: Object,
            required: true
        },
        uid: {
            type: String,
            required: true
        },
        /* wwEditor:start */
        wwEditorState: {
            type: Object,
            required: true
        }
        /* wwEditor:end */
    },
    emits: ['trigger-event', 'update:content'],
    setup(props, { emit }) {
        // Component variable for items per page
        const { value: itemsPerPage, setValue: setItemsPerPage } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'itemsPerPage',
            type: 'number',
            defaultValue: 10
        });

        // Storage key for persisting user preference
        const storageKey = `ww-paginator-limit-${props.uid}`;

        // State - Initialize from localStorage if available
        const selectedLimit = ref(null);

        // Load saved preference from localStorage
        const loadSavedLimit = () => {
            try {
                const saved = localStorage.getItem(storageKey);
                if (saved) {
                    const limit = parseInt(saved);
                    if (!isNaN(limit)) {
                        selectedLimit.value = limit;
                        setItemsPerPage(limit);
                        return limit;
                    }
                }
            } catch (e) {
                console.warn('Failed to load saved limit from localStorage:', e);
            }
            return null;
        };

        // Save preference to localStorage
        const saveLimit = (limit) => {
            try {
                localStorage.setItem(storageKey, limit.toString());
            } catch (e) {
                console.warn('Failed to save limit to localStorage:', e);
            }
        };

        // Initialize with saved value
        loadSavedLimit();

        // Editor state
        const isEditing = computed(() => {
            /* wwEditor:start */
            return props.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            return false;
        });

        // Pagination options
        const paginationOptions = computed(() => {
            if (props.content.useCustomPagination) {
                return {
                    limit: selectedLimit.value || props.content.paginatorLimit,
                    offset: props.content.paginatorOffset,
                    total: props.content.paginatorTotal
                };
            }

            if (!props.content.collectionId) return null;
            return wwLib.wwCollection.getPaginationOptions(props.content.collectionId);
        });

        // Initialize selected limit
        watch(
            () => paginationOptions.value?.limit,
            (newLimit) => {
                if (newLimit && selectedLimit.value === null) {
                    // Check if there's a saved value first
                    const saved = loadSavedLimit();
                    if (!saved) {
                        selectedLimit.value = newLimit;
                    }
                }
            },
            { immediate: true }
        );

        // Computed properties
        const nbPage = computed(() => {
            if (!paginationOptions.value) return 10;
            const nbPage = Math.ceil(paginationOptions.value.total / paginationOptions.value.limit);
            return isNaN(nbPage) ? 1 : nbPage;
        });

        const currentPage = computed(() => {
            if (!paginationOptions.value) return 0;
            const currentPage = Math.floor(paginationOptions.value.offset / paginationOptions.value.limit);
            return isNaN(currentPage) ? 0 : currentPage;
        });

        const navigation = computed(() => {
            const maxVisiblePages = props.content.maxVisiblePages || 5;
            const lastPage = nbPage.value - 1;
            const current = currentPage.value;
            const navigation = [];

            if (nbPage.value <= maxVisiblePages) {
                // Show all pages if total is less than max
                for (let i = 0; i < nbPage.value; i++) {
                    navigation.push({
                        label: `${i + 1}`,
                        index: i,
                        states: i === current ? ['active'] : []
                    });
                }
            } else {
                // Always show first page
                navigation.push({
                    label: '1',
                    index: 0,
                    states: 0 === current ? ['active'] : []
                });

                // Calculate range around current page
                let startPage = Math.max(1, current - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(lastPage, startPage + maxVisiblePages - 3);

                // Adjust start if we're near the end
                if (endPage === lastPage) {
                    startPage = Math.max(1, lastPage - maxVisiblePages + 2);
                }

                // Add separator if needed
                if (startPage > 1) {
                    navigation.push({ label: '...', index: -1 });
                }

                // Add middle pages
                for (let i = startPage; i <= endPage && i < lastPage; i++) {
                    navigation.push({
                        label: `${i + 1}`,
                        index: i,
                        states: i === current ? ['active'] : []
                    });
                }

                // Add separator if needed
                if (endPage < lastPage - 1) {
                    navigation.push({ label: '...', index: -1 });
                }

                // Always show last page
                if (lastPage > 0) {
                    navigation.push({
                        label: `${lastPage + 1}`,
                        index: lastPage,
                        states: lastPage === current ? ['active'] : []
                    });
                }
            }

            return navigation;
        });

        const limitOptions = computed(() => {
            const options = props.content.itemsPerPageOptions || [5, 10, 25, 50, 100];
            return options.sort((a, b) => a - b);
        });

        const itemsPerPageLabel = computed(() => {
            return props.content.itemsPerPageLabel || 'Itens por página:';
        });

        const paginationInfoText = computed(() => {
            if (!paginationOptions.value) return '';
            const start = paginationOptions.value.offset + 1;
            const end = Math.min(
                paginationOptions.value.offset + paginationOptions.value.limit,
                paginationOptions.value.total
            );
            const total = paginationOptions.value.total;
            return `Exibindo ${start}-${end} de ${total}`;
        });

        // Styles
        const containerStyle = computed(() => ({
            '--gap': props.content.gap || '8px',
            '--button-padding': props.content.buttonPadding || '8px 12px',
            '--border-radius': props.content.borderRadius || '6px',
            '--alignment': props.content.alignment || 'center'
        }));

        const buttonStyle = computed(() => ({
            backgroundColor: props.content.buttonBackground || '#ffffff',
            color: props.content.buttonColor || '#374151',
            borderColor: props.content.buttonBorder || '#d1d5db',
            fontSize: props.content.buttonFontSize || '14px'
        }));

        const activeButtonStyle = computed(() => ({
            '--active-bg': props.content.activeButtonBackground || '#3b82f6',
            '--active-color': props.content.activeButtonColor || '#ffffff',
            '--active-border': props.content.activeButtonBorder || '#3b82f6',
            fontSize: props.content.buttonFontSize || '13px'
        }));

        const selectorStyle = computed(() => ({
            backgroundColor: props.content.selectorBackground || '#ffffff',
            color: props.content.selectorColor || '#374151',
            borderColor: props.content.selectorBorder || '#d1d5db',
            fontSize: props.content.selectorFontSize || '14px'
        }));

        const infoTextStyle = computed(() => ({
            color: props.content.infoTextColor || '#6b7280',
            fontSize: props.content.infoTextFontSize || '14px'
        }));

        // Methods
        const goTo = (index) => {
            if (!paginationOptions.value) return;
            if (index !== -1 && index !== currentPage.value) {
                const newOffset = index * paginationOptions.value.limit;

                if (!props.content.useCustomPagination) {
                    wwLib.wwCollection.setOffset(props.content.collectionId, newOffset);
                }

                emit('trigger-event', {
                    name: 'change',
                    event: {
                        context: {
                            offset: newOffset,
                            page: index + 1,
                            total: paginationOptions.value.total,
                            limit: paginationOptions.value.limit
                        }
                    }
                });
            }
        };

        const prev = () => {
            if (currentPage.value > 0) {
                goTo(currentPage.value - 1);
            }
        };

        const next = () => {
            if (currentPage.value < nbPage.value - 1) {
                goTo(currentPage.value + 1);
            }
        };

        const handleLimitChange = () => {
            if (isEditing.value) return;

            const newLimit = parseInt(selectedLimit.value);

            // Update component variable
            setItemsPerPage(newLimit);

            // Save to localStorage for persistence
            saveLimit(newLimit);

            if (!props.content.useCustomPagination && props.content.collectionId) {
                wwLib.wwCollection.setLimit(props.content.collectionId, newLimit);
                wwLib.wwCollection.setOffset(props.content.collectionId, 0);
            }

            emit('trigger-event', {
                name: 'limitChange',
                event: {
                    context: {
                        limit: newLimit,
                        offset: 0,
                        page: 1,
                        total: paginationOptions.value?.total || 0
                    }
                }
            });
        };

        // Watch for custom pagination mode change
        watch(
            () => props.content.useCustomPagination,
            (value) => {
                if (value) {
                    emit('update:content', { collectionId: null });
                }
            }
        );

        return {
            isEditing,
            selectedLimit,
            itemsPerPage,
            paginationOptions,
            nbPage,
            currentPage,
            navigation,
            limitOptions,
            itemsPerPageLabel,
            paginationInfoText,
            containerStyle,
            buttonStyle,
            activeButtonStyle,
            selectorStyle,
            infoTextStyle,
            goTo,
            prev,
            next,
            handleLimitChange
        };
    }
};
</script>

<style scoped lang="scss">
.ww-paginator-wrapper {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: var(--alignment, center) !important;
    flex-wrap: wrap !important;
    gap: 16px !important;
    width: 100% !important;
    padding: 12px 0 !important;
}

.items-per-page-selector {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    flex: 0 0 auto !important;

    .selector-label {
        font-size: 13px !important;
        color: #374151 !important;
        font-weight: 500 !important;
        white-space: nowrap !important;
    }

    .selector-dropdown {
        padding: 6px 28px 6px 10px !important;
        border: 1px solid #d1d5db !important;
        border-radius: 6px !important;
        background-color: #ffffff !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        font-family: inherit !important;
        font-size: 13px !important;
        appearance: none !important;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E") !important;
        background-repeat: no-repeat !important;
        background-position: right 8px center !important;
        min-width: 60px !important;
        height: 36px !important;
        line-height: 1 !important;
        box-sizing: border-box !important;

        &:hover:not(:disabled) {
            border-color: #9ca3af;
        }

        &:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }
}

.ww-paginator {
    display: flex !important;
    flex-direction: row !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 6px !important;
    flex: 0 0 auto !important;
}

.pagination-button {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: 36px !important;
    height: 36px !important;
    padding: 0 10px !important;
    border: 1px solid !important;
    border-radius: 6px !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    font-family: inherit !important;
    font-size: 13px !important;
    font-weight: 500 !important;
    user-select: none !important;
    line-height: 1 !important;
    box-sizing: border-box !important;

    &:hover:not(:disabled):not(.separator) {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    &:active:not(:disabled):not(.separator) {
        transform: translateY(0);
    }

    &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &.disabled,
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
    }

    &.separator {
        border: none;
        background: transparent;
        cursor: default;
        min-width: 40px;
        color: #6b7280;
        font-weight: 600;

        &:hover {
            transform: none;
            box-shadow: none;
        }
    }

    &.active {
        font-weight: 600 !important;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
        background-color: var(--active-bg) !important;
        color: var(--active-color) !important;
        border-color: var(--active-border) !important;
    }

    &.pagination-arrow {
        min-width: 36px !important;
        padding: 0 10px !important;
    }
}

.pagination-info {
    font-size: 13px !important;
    color: #6b7280 !important;
    font-weight: 500 !important;
    white-space: nowrap !important;
    flex: 0 0 auto !important;
}

// Responsive
@media (max-width: 768px) {
    .ww-paginator-wrapper {
        flex-direction: column;
        gap: 16px;
    }

    .pagination-button {
        min-width: 40px;
        min-height: 40px;
        padding: 8px 12px;
    }
}
</style>
