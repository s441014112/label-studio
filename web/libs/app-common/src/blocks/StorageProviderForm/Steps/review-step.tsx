interface ReviewStepProps {
  formData: any;
  filesPreview?: any;
  formatSize?: (bytes: number) => string;
  t: any;
}

export const ReviewStep = ({ formData, filesPreview, formatSize, t }: ReviewStepProps) => {
  const getProviderDisplayName = (provider: string) => {
    const providerMap: Record<string, string> = {
      s3: t("pages.settings.storage_setting.amazon_s3"),
      gcp: t("pages.settings.storage_setting.google_cloud_storage"),
      azure: t("pages.settings.storage_setting.azure_storage"),
      redis: t("pages.settings.storage_setting.redis_storage"),
      localfiles: t("pages.settings.storage_setting.local_files"),
    };
    return providerMap[provider] || provider;
  };

  const getBucketName = () => {
    return formData.bucket || formData.container || "Not specified";
  };

  const getFileCount = () => {
    if (!filesPreview) return t("common.blocks.count_files", { count: 0 });

    // Check if the last file is the "preview limit reached" indicator
    const lastFile = filesPreview[filesPreview.length - 1];
    const hasMoreFiles = lastFile && lastFile.key === null;

    if (hasMoreFiles) {
      // Subtract 1 to exclude the placeholder file
      const visibleFileCount = filesPreview.length - 1;
      return t("common.blocks.more_than_count_files", { count: visibleFileCount });
    }

    return t("common.blocks.count_files", { count: filesPreview.length });
  };

  const getTotalSize = () => {
    if (!filesPreview || !formatSize) return t("common.blocks.count_bytes", { count: 0 });

    // Check if the last file is the "preview limit reached" indicator
    const lastFile = filesPreview[filesPreview.length - 1];
    const hasMoreFiles = lastFile && lastFile.key === null;

    // Calculate total size excluding the placeholder file if it exists
    const filesToCount = hasMoreFiles ? filesPreview.slice(0, -1) : filesPreview;
    const totalBytes = filesToCount.reduce((sum: number, file: any) => sum + (file.size || 0), 0);

    if (hasMoreFiles) {
      return t("common.blocks.ready_to_connect", { size: formatSize(totalBytes) });
    } 

    return formatSize(totalBytes);
  };

  return (
    <div>
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{ t("common.blocks.ready_to_connect") }</h2>
        <p className="text-gray-600 mt-1">{ t("common.blocks.ready_to_connect_help") }</p>
      </div>

      {/* Connection Details Section */}
      <div className="grid grid-cols-2 gap-y-4 mb-8">
        <div>
          <p className="text-sm text-gray-500">{ t("common.blocks.provider") }</p>
          <p className="font-medium">{getProviderDisplayName(formData.provider)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">{ t("common.blocks.storage_location") }</p>
          <p className="font-medium">{getBucketName()}</p>
        </div>

        {formData.prefix && (
          <div>
            <p className="text-sm text-gray-500">{ t("common.blocks.prefix") }</p>
            <p className="font-medium">{formData.prefix}</p>
          </div>
        )}

        {filesPreview && (
          <>
            <div>
              <p className="text-sm text-gray-500">{ t("common.blocks.files_to_import") }</p>
              <p className="font-medium">{getFileCount()}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">{ t("common.blocks.total_size") }</p>
              <p className="font-medium">{getTotalSize()}</p>
            </div>
          </>
        )}
      </div>

      {/* Import Process Section */}
      <div className="bg-primary-background border border-primary-border-subtler rounded-small p-4 mb-8">
        <h3 className="text-lg font-semibold mb-2">{ t("common.blocks.import_process") }</h3>
        <p>{ t("common.blocks.import_process_help") }</p>
      </div>
    </div>
  );
};
