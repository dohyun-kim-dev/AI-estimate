import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styled from 'styled-components';
import { useAuthStore } from '@/store/authStore';
const PrintableInvoiceWrapper = styled.div `
  width: 780px;
  padding: 40px;
  background-color: white;
  color: black;
  font-family: 'Pretendard', sans-serif;
  box-sizing: border-box;
  font-size: 11pt;
  
  @media print {
    @page {
      margin: 15mm 0; /* 상하 여백 */
    }
  }
`;
export const PrintableInvoice = ({ estimate }) => {
    const formatDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    const currentDate = formatDate(new Date());
    const user = useAuthStore((state) => state.user);
    const baseCellStyle = {
        padding: '8px 12px',
        border: '1px solid #BFBFBF',
        fontSize: '9pt',
        lineHeight: '1.3',
    };
    const headerCellStyle = {
        ...baseCellStyle,
        backgroundColor: '#F2F2F2',
        fontWeight: 'bold',
        textAlign: 'center',
    };
    const valueCellStyle = {
        ...baseCellStyle,
        textAlign: 'left',
    };
    const stampContainerStyle = {
        position: 'relative',
        width: '100%',
        height: '100%',
    };
    const stampImageStyle = {
        position: 'absolute',
        right: '20px',
        bottom: '20px',
        width: '60px',
        height: '60px',
    };
    return (_jsxs(PrintableInvoiceWrapper, { id: "printable-invoice-content", children: [_jsx("div", { style: { fontSize: '20pt', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }, children: "\uACAC\uC801\uC11C" }), _jsx("table", { style: { width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }, children: _jsxs("tbody", { children: [_jsxs("tr", { children: [_jsx("td", { style: { ...headerCellStyle, width: '15%' }, children: "\uACAC\uC801 \uBC1C\uD589\uC77C" }), _jsx("td", { style: { ...valueCellStyle, width: '25%' }, children: currentDate }), _jsx("td", { style: { ...headerCellStyle, width: '15%' }, children: "\uC0C1\uD638\uBA85" }), _jsx("td", { style: { ...valueCellStyle, width: '30%' }, children: "\uC8FC\uC2DD\uD68C\uC0AC \uC5EC\uAE30\uB2F7" }), _jsx("td", { style: {
                                        width: '15%',
                                        border: '1px solid #BFBFBF',
                                        borderStyle: 'double',
                                        background: 'white',
                                        position: 'relative'
                                    }, rowSpan: 5, children: _jsx("div", { style: {
                                            position: 'absolute',
                                            right: '20px',
                                            bottom: '60px',
                                            width: '60px',
                                            height: '60px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            // marginLeft: '10px'
                                        }, children: _jsx("img", { src: "/ai-estimate/stamp.png", alt: "\uC9C1\uC778", style: {
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain'
                                            } }) }) })] }), _jsxs("tr", { children: [_jsx("td", { style: headerCellStyle, children: "\uACE0\uAC1D\uBA85" }), _jsxs("td", { style: valueCellStyle, children: [user?.name || 'guest', " ", user?.cellphone ? ' 82+' : '', " ", user?.cellphone || ''] }), _jsx("td", { style: headerCellStyle, children: "\uB300\uD45C\uC790\uBA85" }), _jsx("td", { style: valueCellStyle, children: "\uAC15\uD0DC\uC6D0 82+031-8039-7981" })] }), _jsxs("tr", { children: [_jsx("td", { style: headerCellStyle, children: "\uBA54\uC77C\uC8FC\uC18C" }), _jsx("td", { style: valueCellStyle, children: user?.email || 'guest' }), _jsx("td", { style: headerCellStyle, children: "\uC0AC\uC5C5\uC790\uBC88\uD638" }), _jsx("td", { style: valueCellStyle, children: "289-86-03278" })] }), _jsxs("tr", { children: [_jsx("td", { style: headerCellStyle, children: "\uACAC\uC801\uBA85" }), _jsx("td", { style: valueCellStyle, children: estimate.project_name }), _jsx("td", { style: headerCellStyle, children: "\uC5C5\uC885\u00B7\uC5C5\uD0DC" }), _jsx("td", { style: valueCellStyle, children: "\uC751\uC6A9\uC18C\uD504\uD2B8\uC6E8\uC5B4 \uAC1C\uBC1C \uBC0F \uACF5\uAE09\uC5C5, \uC11C\uBE44\uC2A4\uC5C5" })] }), _jsxs("tr", { children: [_jsx("td", { style: headerCellStyle, children: "\uCD1D \uAE08\uC561 (VAT\uD3EC\uD568)" }), _jsxs("td", { style: valueCellStyle, children: ["KRW ", estimate.vat_included_price] }), _jsx("td", { style: headerCellStyle, children: "\uC8FC\uC18C" }), _jsx("td", { style: valueCellStyle, children: "\uACBD\uAE30\uB3C4 \uC131\uB0A8\uC2DC \uC218\uC815\uAD6C \uB300\uD559\uD310\uAD50\uB85C 815, 777\uD638 (\uC2DC\uD765\uB3D9, \uD310\uAD50\uCC3D\uC870\uACBD\uC81C\uBC38\uB9AC)" })] })] }) }), _jsx("div", { style: { fontSize: '14pt', fontWeight: 'bold', marginBottom: '15px', marginTop: '40px' }, children: "\uACAC\uC801 \uC0C1\uC138" }), _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', pageBreakInside: 'avoid' }, children: [_jsx("thead", { style: { display: 'table-header-group' }, children: _jsxs("tr", { children: [_jsx("th", { style: { ...headerCellStyle, width: '15%' }, children: "\uAD6C\uBD84" }), _jsx("th", { style: { ...headerCellStyle, width: '20%' }, children: "\uBA54\uB274" }), _jsx("th", { style: { ...headerCellStyle, width: '20%' }, children: "\uD56D\uBAA9" }), _jsx("th", { style: { ...headerCellStyle, width: '30%' }, children: "\uC138\uBD80\uB0B4\uC6A9" }), _jsx("th", { style: { ...headerCellStyle, width: '15%' }, children: "\uAE08\uC561" })] }) }), _jsxs("tbody", { children: [estimate.categories.map((category) => {
                                // 각 카테고리의 모든 아이템을 플랫하게 만들기
                                const items = category.sub_categories.reduce((acc, subCategory) => {
                                    return [...acc, ...subCategory.items.map(item => ({
                                            ...item,
                                            category: category.category_name,
                                            subCategory: subCategory.sub_category_name
                                        }))];
                                }, []);
                                // 연속된 같은 카테고리와 서브카테고리 찾기
                                let currentRowSpan = { category: 0, subCategory: 0 };
                                let lastCategory = '';
                                let lastSubCategory = '';
                                return items.map((item, index) => {
                                    const showCategory = item.category !== lastCategory;
                                    const showSubCategory = item.subCategory !== lastSubCategory || showCategory;
                                    // 다음 항목들 중 같은 카테고리/서브카테고리 개수 계산
                                    if (showCategory) {
                                        currentRowSpan.category = items.slice(index).filter(i => i.category === item.category).length;
                                        lastCategory = item.category;
                                    }
                                    if (showSubCategory) {
                                        currentRowSpan.subCategory = items.slice(index).filter(i => i.subCategory === item.subCategory &&
                                            i.category === item.category).length;
                                        lastSubCategory = item.subCategory;
                                    }
                                    return (_jsxs("tr", { style: { pageBreakInside: 'avoid' }, children: [showCategory && (_jsx("td", { style: {
                                                    ...valueCellStyle,
                                                    textAlign: 'center',
                                                    pageBreakInside: 'avoid'
                                                }, rowSpan: currentRowSpan.category, children: item.category.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uAC00-\uD7A3\s]/g, '').trim() })), showSubCategory && (_jsx("td", { style: {
                                                    ...valueCellStyle,
                                                    textAlign: 'center',
                                                    pageBreakInside: 'avoid',
                                                    breakAfter: 'auto',
                                                    breakBefore: 'auto',
                                                    paddingTop: '4px',
                                                    paddingBottom: '4px'
                                                }, rowSpan: currentRowSpan.subCategory, children: item.subCategory })), _jsx("td", { style: {
                                                    ...valueCellStyle,
                                                    textAlign: 'center',
                                                    paddingTop: '4px',
                                                    paddingBottom: '4px'
                                                }, children: item.name }), _jsx("td", { style: {
                                                    ...valueCellStyle,
                                                    paddingTop: '4px',
                                                    paddingBottom: '4px'
                                                }, children: item.description }), _jsx("td", { style: {
                                                    ...valueCellStyle,
                                                    textAlign: 'right',
                                                    paddingTop: '4px',
                                                    paddingBottom: '4px'
                                                }, children: item.price })] }, `${item.category}-${item.subCategory}-${index}`));
                                });
                            }), _jsxs("tr", { children: [_jsx("td", { colSpan: 4, style: { ...headerCellStyle, textAlign: 'right' }, children: _jsx("strong", { children: "\uD569\uACC4 (\uBD80\uAC00\uC138 \uBCC4\uB3C4)" }) }), _jsx("td", { style: { ...valueCellStyle, textAlign: 'right' }, children: _jsx("strong", { children: estimate.total_price }) })] }), _jsxs("tr", { children: [_jsx("td", { colSpan: 4, style: { ...headerCellStyle, textAlign: 'right' }, children: _jsx("strong", { children: "\uBD80\uAC00\uC138 \uD3EC\uD568" }) }), _jsx("td", { style: { ...valueCellStyle, textAlign: 'right' }, children: _jsx("strong", { children: estimate.vat_included_price }) })] }), _jsxs("tr", { children: [_jsx("td", { colSpan: 4, style: { ...headerCellStyle, textAlign: 'right' }, children: "\uAC1C\uBC1C \uAE30\uAC04" }), _jsx("td", { style: { ...valueCellStyle, textAlign: 'right' }, children: `${estimate.estimated_period}(약 ${Math.ceil(parseInt(estimate.estimated_period) / 4.345)}개월)` })] })] })] }), _jsx("div", { style: { fontSize: '14pt', fontWeight: 'bold', marginBottom: '15px', marginTop: '40px' }, children: "\uBE44\uACE0\uC0AC\uD56D" }), _jsx("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: '9pt' }, children: _jsx("tbody", { children: _jsx("tr", { children: _jsxs("td", { style: { ...valueCellStyle, padding: '12px' }, children: ["\u2022 \uAC80\uC218\uAE30\uAC04: \uAC1C\uBC1C \uC644\uB8CC\uC77C \uC775\uC77C\uBD80\uD130 1\uAC1C\uC6D4 (\uC774\uD6C4 \uC694\uCCAD \uBCC4\uB3C4 \uD611\uC758 \uD544\uC694)", _jsx("br", {}), "\u2022 \uD558\uC790\uBCF4\uC218: \uAC80\uC218 \uC885\uB8CC\uC77C \uC775\uC77C\uBD80\uD130 6\uAC1C\uC6D4 (\uAE30\uD68D\uACFC \uB514\uC790\uC778 \uBCC0\uACBD \uBCC4\uB3C4 \uD611\uC758 \uD544\uC694)", _jsx("br", {}), "\u2022 \uAE30\uC220\uC2A4\uD0DD: (\uC571)hybridapp, Flutter, webview, (\uC6F9)react.js, express.js, node.js, java spring boot", _jsx("br", {}), "\u2022 \uD06C\uB85C\uC2A4 \uD50C\uB7AB\uD3FC: \uC708\uB3C4\uC6B010 \uC774\uC0C1 \uBC0F \uB9E5 \uC6B4\uC601\uCCB4\uC81C / \uAC24\uB7ED\uC2DC \uBC0F \uC544\uC774\uD3F0 \uCD9C\uC2DC 5\uB144 \uC774\uD558 \uAE30\uAE30", _jsx("br", {}), _jsx("br", {}), "* \uACAC\uC801\uC11C\uB294 \uC791\uC131\uC77C\uB85C\uBD80\uD130 \uC77C\uC8FC\uC77C\uAC04 \uC720\uD6A8\uD569\uB2C8\uB2E4.", _jsx("br", {}), "* \uB3C4\uBA54\uC778/\uC11C\uBC84\uBE44\uC6A9/\uAC1C\uBC1C\uC790 \uACC4\uC815/\uC54C\uB9BC \uC218\uB2E8/\uC720\uB8CCAPI \uB4F1\uC5D0 \uB530\uB77C \uBC1C\uC0DD\uD558\uB294 \uBE44\uC6A9\uC740 \uBCC4\uB3C4\uC785\uB2C8\uB2E4.", _jsx("br", {}), "* AI \uACAC\uC801\uC740 \uC2E4\uC81C \uACC4\uC57D \uC2DC \uAE08\uC561\uACFC \uC77C\uBD80 \uC0C1\uC774\uD560 \uC218 \uC788\uC73C\uBA70, \uBCF4\uB2E4 \uC815\uD655\uD55C \uACAC\uC801\uC740 \uB2F4\uB2F9\uC790\uC640\uC758 \uCD5C\uC885 \uD611\uC758\uB97C \uD1B5\uD574 \uD655\uC815\uB429\uB2C8\uB2E4."] }) }) }) })] }));
};
