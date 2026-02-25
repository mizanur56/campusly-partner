import { useState } from "react";
import { Button } from "../../components/ui/button";
import { SignaturePad } from "../../components/contract/SignaturePad";

export default function ContractPage() {
  const [signatureImageDataUrl, setSignatureImageDataUrl] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signedAt, setSignedAt] = useState<string | null>(null);

  const hasSigned = !!signatureImageDataUrl;

  const handleSaveSignature = (dataUrl: string) => {
    setSignatureImageDataUrl(dataUrl);
    setSignedAt(
      new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
    setShowSignaturePad(false);
  };

  const handleUpdateSignature = () => {
    setSignatureImageDataUrl(null);
    setSignedAt(null);
    setShowSignaturePad(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50/50 px-4 py-8 dark:bg-gray-950/30 md:px-6 md:py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row lg:gap-10">
        {/* Left: Contract progress card */}
        <aside className="w-full shrink-0 lg:w-56 xl:w-64">
          <div className="lg:sticky lg:top-24 rounded-[24px] border border-neutral-100 bg-white p-5 card-shadow dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Contract
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              1/1 completed •{" "}
              <span className="font-medium text-warning-700 dark:text-warning-400">
                {hasSigned ? "Under final review" : "Under review"}
              </span>
            </p>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-600">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="text-gray-800 dark:text-gray-100">
                  View and sign
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-warning-300 bg-warning-50 text-warning-600 dark:border-warning-700 dark:bg-warning-900/20">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l2 2m6-2a8 8 0 11-16 0 8 8 0 0116 0z"
                    />
                  </svg>
                </span>
                <span className="text-gray-700 dark:text-gray-200">
                  Under review
                </span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Right: Contract content */}
        <main className="min-w-0 flex-1">
          <div className="overflow-hidden rounded-[24px] border border-neutral-100 bg-white card-shadow dark:border-gray-800 dark:bg-gray-900">
            {/* Header */}
            <header className="border-b border-gray-100 px-6 py-6 dark:border-gray-800 sm:px-8 sm:py-7">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                Partnership Contract
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Please review and complete the following steps to finalize your
                partnership.
              </p>
            </header>

            <div className="space-y-8 px-6 py-6 sm:px-8 sm:py-7 divide-y divide-gray-100 dark:divide-gray-800">
              {/* Contract signature viewer */}
              <section className="pt-1 first:pt-0">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      Contract Signature
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      Page 1 of 2
                    </span>
                  </div>
                  <Button variant="primary" size="sm">
                    Download PDF
                  </Button>
                </div>
                <div className="bg-gray-50 px-4 py-4 dark:bg-gray-950 sm:px-5 sm:py-5">
                  <div className="mx-auto h-[360px] max-w-full rounded-xl border border-dashed border-gray-300 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        Contract preview
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your contract PDF will appear here. Use this space to
                        show a read-only preview of the document.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Onboarding manager card */}
              <section className="pt-6">
                <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-5">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    Your Onboarding Manager
                  </h2>
                </div>
                <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-500 dark:bg-gray-700 dark:text-gray-200">
                      DS
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Dipak Sharma
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        tareq97@gmail.com
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        +881787939155 • st.thompson@company.com
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-start sm:justify-end">
                    <Button variant="primary" size="sm">
                      Arrange meeting
                    </Button>
                  </div>
                </div>
              </section>

              {/* Digital signature card */}
              <section className="pt-6">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800 sm:px-5">
                  <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    Digital Signature
                  </h2>
                  {hasSigned && (
                    <span className="rounded-full bg-success-50 px-2 py-0.5 text-xs font-medium text-success-700 dark:bg-success-900/20 dark:text-success-400">
                      Signed
                    </span>
                  )}
                </div>
                <div className="px-4 py-4 sm:px-5 sm:py-5">
                  {showSignaturePad ? (
                    <SignaturePad
                      height={180}
                      onSave={handleSaveSignature}
                      onCancel={() => setShowSignaturePad(false)}
                    />
                  ) : !hasSigned ? (
                    <>
                      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center dark:border-gray-700 dark:bg-gray-900/40">
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                            Ready to sign
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Add your digital signature to complete this
                            contract. Click the button and draw in the box.
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-start">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setShowSignaturePad(true)}
                        >
                          Add your signature
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/40">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Signature
                          </p>
                          <div className="mt-2 flex items-center justify-center rounded-lg bg-white py-4 dark:bg-gray-950">
                            {signatureImageDataUrl && (
                              <img
                                src={signatureImageDataUrl}
                                alt="Your signature"
                                className="max-h-16 w-auto object-contain"
                              />
                            )}
                          </div>
                          {signedAt && (
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Signed on {signedAt}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <Button variant="secondary" size="sm" type="button">
                            View signed contract
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={handleUpdateSignature}
                          >
                            Update signature
                          </Button>
                          <Button
                            as="link"
                            to="/contract/signed"
                            variant="primary"
                            size="sm"
                          >
                            Submit signed contract
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}