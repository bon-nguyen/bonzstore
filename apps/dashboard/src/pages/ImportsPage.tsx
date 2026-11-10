import { useState } from 'react';
import { ImportCatalogPickerDrawer } from '../features/imports/components/ImportCatalogPickerDrawer';
import { ImportCreateProductModal } from '../features/imports/components/ImportCreateProductModal';
import { ImportExcelModal } from '../features/imports/components/ImportExcelModal';
import { ImportGeneralInfoSection } from '../features/imports/components/ImportGeneralInfoSection';
import { ImportHistorySection } from '../features/imports/components/ImportHistorySection';
import { ImportLogisticsCreateModal } from '../features/imports/components/ImportLogisticsCreateModal';
import { ImportPageHeader } from '../features/imports/components/ImportPageHeader';
import { ImportPaymentSection } from '../features/imports/components/ImportPaymentSection';
import { ImportProductsTable } from '../features/imports/components/ImportProductsTable';
import { ImportQuickToolbar } from '../features/imports/components/ImportQuickToolbar';
import { useImportFormManager } from '../features/imports/hooks/useImportFormManager';

export function ImportsPage() {
  const {
    activeTab,
    setActiveTab,
    editingDraftId,
    control,
    setValue,
    getValues,
    items,
    exchangeRateCny,
    catalogProducts,
    isLoadingProducts,
    categories,
    leafCategories,
    createProductMutation,
    logisticsOptions,
    staffOptions,
    completedReceipts,
    draftReceipts,
    flattenedCatalogSkus,
    subtotalBeforeTax,
    orderDiscountAmount,
    vatAmount,
    totalPayable,
    totalWithShipping,
    debtRemaining,
    isSavingReceipt,
    setIsAmountPaidTouched,
    handleSelectProductSku,
    handleAddBlankRow,
    handleUpdateRow,
    handleRemoveRow,
    handleResetForm,
    handleSaveDraft,
    handleSaveReceipt,
    executeFinalizeImport,
    handleResumeRecord,
    handleDeleteRecord,
  } = useImportFormManager();

  // Modals / Drawers state
  const [isCreateLogisticsModalOpen, setIsCreateLogisticsModalOpen] =
    useState(false);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] =
    useState(false);
  const [initialCreateProductTitle, setInitialCreateProductTitle] =
    useState('');
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isCatalogPickerOpen, setIsCatalogPickerOpen] = useState(false);

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 pb-10">
      {/* Header trang tái sử dụng */}
      <ImportPageHeader
        activeTab={activeTab}
        catalogProductsCount={catalogProducts.length}
        editingDraftId={editingDraftId}
        receiptNumber={getValues('receiptNumber')}
        onResetForm={handleResetForm}
      />

      {/* ====================================================================
          TRANG 1 (/imports): FORM LẬP PHIẾU NHẬP HÀNG (CREATE)
         ==================================================================== */}
      {activeTab === 'CREATE' && (
        <>
          <ImportGeneralInfoSection
            control={control}
            setValue={setValue}
            logisticsOptions={logisticsOptions}
            staffOptions={staffOptions}
            savedReceiptsCount={completedReceipts.length}
            onOpenCreateLogistics={() => setIsCreateLogisticsModalOpen(true)}
          />

          <ImportQuickToolbar
            onSelectProductSku={handleSelectProductSku}
            onAddBlankRow={handleAddBlankRow}
            onOpenCatalogPicker={() => setIsCatalogPickerOpen(true)}
            onOpenExcelModal={() => setIsExcelModalOpen(true)}
            onOpenCreateProductModal={(initialSearch) => {
              setInitialCreateProductTitle(initialSearch || '');
              setIsCreateProductModalOpen(true);
            }}
          />

          <ImportProductsTable
            items={items}
            exchangeRateCny={exchangeRateCny}
            catalogProductsCount={catalogProducts.length}
            subtotalBeforeTax={subtotalBeforeTax}
            orderDiscountAmount={orderDiscountAmount}
            onUpdateRow={handleUpdateRow}
            onRemoveRow={handleRemoveRow}
            onAddBlankRow={handleAddBlankRow}
            onOpenCatalogPicker={() => setIsCatalogPickerOpen(true)}
          />

          <ImportPaymentSection
            control={control}
            setValue={setValue}
            subtotalBeforeTax={subtotalBeforeTax}
            vatAmount={vatAmount}
            orderDiscountAmount={orderDiscountAmount}
            totalPayable={totalPayable}
            totalWithShipping={totalWithShipping}
            debtRemaining={debtRemaining}
            isSavingReceipt={isSavingReceipt}
            isEditingDraft={Boolean(editingDraftId)}
            onMarkAmountPaidTouched={() => setIsAmountPaidTouched(true)}
            onSaveDraft={handleSaveDraft}
            onSaveReceipt={handleSaveReceipt}
          />
        </>
      )}

      {/* ====================================================================
          TRANG 2 (/imports/history): LỊCH SỬ NHẬP HÀNG (2 TABS: LỊCH SỬ & LƯU TẠM)
         ==================================================================== */}
      {(activeTab === 'HISTORY' || activeTab === 'DRAFTS') && (
        <ImportHistorySection
          mode={activeTab === 'DRAFTS' ? 'DRAFTS' : 'HISTORY'}
          completedRecords={completedReceipts}
          draftRecords={draftReceipts}
          onModeChange={(nextMode) => setActiveTab(nextMode)}
          onResumeRecord={handleResumeRecord}
          onFinalizeDraft={(draftRec) =>
            executeFinalizeImport(
              draftRec,
              draftRec.subtotalBeforeTax,
              draftRec.vatAmount,
              draftRec.orderDiscountAmount,
              draftRec.totalPayable,
              draftRec.debtRemaining,
              draftRec.id,
            )
          }
          onDeleteRecord={handleDeleteRecord}
        />
      )}

      {/* Modal thêm nhanh Đơn vị Logistics (Nhà phân phối) */}
      <ImportLogisticsCreateModal
        open={isCreateLogisticsModalOpen}
        onClose={() => setIsCreateLogisticsModalOpen(false)}
        onCreated={(createdUnit) => {
          setValue('logisticsUnitId', createdUnit.id, { shouldDirty: true });
          setValue('logisticsUnitName', createdUnit.name, {
            shouldDirty: true,
          });
          setIsCreateLogisticsModalOpen(false);
        }}
      />

      {/* Modal tạo mới sản phẩm vào bảng Products */}
      <ImportCreateProductModal
        open={isCreateProductModalOpen}
        leafCategories={leafCategories}
        initialTitle={initialCreateProductTitle}
        exchangeRateCny={exchangeRateCny}
        isSubmitting={createProductMutation.isPending}
        onClose={() => setIsCreateProductModalOpen(false)}
        onCreateProduct={async (payload) => {
          const currentItems = getValues('items') ?? [];
          try {
            const created = await createProductMutation.mutateAsync({
              title: payload.title,
              categoryId:
                payload.categoryId ||
                leafCategories[0]?.id ||
                categories[0]?.id ||
                'cat-leaf-default',
              brandName: payload.brandName || 'Bonzstore Official',
              sellerSku: payload.sellerSku,
              originalPrice: payload.salePrice,
              salePrice: payload.salePrice,
              stockQuantity: payload.quantity,
              status: 'ACTIVE',
              tags: ['Nhập kho mới'],
            });

            const createdSku = created.skus?.[0];
            setValue(
              'items',
              [
                ...currentItems,
                {
                  lineId: `line-${Date.now()}`,
                  productId: created.id,
                  skuId: createdSku?.id,
                  isGift: false,
                  itemCode: createdSku?.sellerSku || payload.sellerSku,
                  itemName: created.title,
                  unit: payload.unit,
                  expiryDate: payload.expiryDate,
                  quantity: payload.quantity,
                  cnyUnitPrice: payload.cnyUnitPrice,
                  unitPrice: payload.importPrice,
                  productDiscountType: 'VND',
                  productDiscountValue: 0,
                  currentStock: createdSku?.stockQuantity ?? payload.quantity,
                },
              ],
              { shouldDirty: true },
            );
            setIsCreateProductModalOpen(false);
          } catch {
            setValue(
              'items',
              [
                ...currentItems,
                {
                  lineId: `line-${Date.now()}`,
                  isGift: false,
                  itemCode: payload.sellerSku,
                  itemName: payload.title,
                  unit: payload.unit,
                  expiryDate: payload.expiryDate,
                  quantity: payload.quantity,
                  cnyUnitPrice: payload.cnyUnitPrice,
                  unitPrice: payload.importPrice,
                  productDiscountType: 'VND',
                  productDiscountValue: 0,
                },
              ],
              { shouldDirty: true },
            );
            setIsCreateProductModalOpen(false);
          }
        }}
      />

      {/* Modal nhập Excel / CSV */}
      <ImportExcelModal
        open={isExcelModalOpen}
        exchangeRateCny={exchangeRateCny}
        catalogSkus={flattenedCatalogSkus}
        onClose={() => setIsExcelModalOpen(false)}
        onImported={(importedLines) => {
          const currentItems = getValues('items') ?? [];
          setValue('items', [...currentItems, ...importedLines], {
            shouldDirty: true,
          });
          setIsExcelModalOpen(false);
        }}
      />

      {/* Drawer chọn nhanh nhiều sản phẩm từ bảng Products */}
      <ImportCatalogPickerDrawer
        open={isCatalogPickerOpen}
        isLoadingProducts={isLoadingProducts}
        flattenedCatalogSkus={flattenedCatalogSkus}
        items={items}
        onClose={() => setIsCatalogPickerOpen(false)}
        onSelectProductSku={handleSelectProductSku}
      />
    </div>
  );
}
