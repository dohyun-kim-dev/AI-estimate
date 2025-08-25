interface TermsAgreementProps {
    onAgreeChange: (privacyAgreed: boolean, termsAgreed: boolean) => void;
    initialPrivacyAgreed?: boolean;
    initialTermsAgreed?: boolean;
}
declare const TermsAgreement: React.FC<TermsAgreementProps>;
export default TermsAgreement;
