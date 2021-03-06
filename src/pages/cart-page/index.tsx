import styled, { keyframes } from "styled-components";
import { fadeIn } from "react-animations";
import { useState, useEffect, useRef, useCallback } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import BSCarousel from "../../components/bs-carousel";
import CartPicker from "./styled-cart-picker";
import FixedOffcanva, {
  SharedNoneCheckedButton,
  SharedCheckedAllButton,
  SharedSelectionHeader,
  SharedTotalPriceShower,
} from "./styled-fixed-offcanv";
import { CTAPrimaryButton, CTASecondaryButton } from "../../components/button";
import { ReactComponent as trash } from "../../imgs/pages/cart-page/trash.svg";
import { ReactComponent as checkNoneFilled } from "../../imgs/pages/cart-page/square.svg";
import { ReactComponent as checkFilled } from "../../imgs/pages/cart-page/check-square-fill.svg";
import { ReactComponent as linkIcon } from "../../imgs/pages/cart-page/link-45deg.svg";
import {
  BG_SECONDARY1,
  BG_SECONDARY4,
  BREAKPOINT_MOBILE,
  BREAKPOINT_PAD,
  COLOR_SECONDARY2,
  HEADER_HEIGHT_MOBILE,
  HEADER_HEIGHT_PAD,
  MAX_CONTAINER_WIDTH,
  Z_INDEX_LV1,
} from "../../constant";
import Modal from "../../components/modal";
import { useHistory } from "react-router";
import { addCartItem } from "../../redux/reducers/cartSlice";
import { useReduxDispatch, useReduxSelector } from "../../redux/store";

const PageContainer = styled.div`
  background-color: ${BG_SECONDARY4};
`;
const ContentContainer = styled.main`
  max-width: ${MAX_CONTAINER_WIDTH};
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;

  // 從頁面頂端計算 Header Component 目前的高度，並從這當作起點開始 render
  ${BREAKPOINT_MOBILE} {
    margin-top: ${HEADER_HEIGHT_MOBILE};
  }

  ${BREAKPOINT_PAD} {
    margin-top: ${HEADER_HEIGHT_PAD};
  }
`;

const CartTitle = styled.h1.attrs(() => ({
  className: "fs-h1",
}))<{
  margin?: string;
  textAlign?: boolean;
}>`
  color: ${COLOR_SECONDARY2};
  padding-top: 2rem;
  margin: ${(props) => props.margin || "0 0 4rem 0"};
  text-align: ${(props) => props.textAlign && "center"};

  // 根據不同裝置寬度預設跟 Header 保持 margin-top: 0rem
  ${BREAKPOINT_MOBILE} {
    margin-top: calc(${HEADER_HEIGHT_MOBILE});
  }

  ${BREAKPOINT_PAD} {
    margin-top: calc(${HEADER_HEIGHT_PAD});
  }
`;

const CartSubTitle = styled.h2.attrs(() => ({
  className: "fs-h2",
}))`
  text-align: center;
`;

const CartProductsForMobile = styled.section`
  display: block;
  margin-bottom: 4rem;

  ${BREAKPOINT_MOBILE} {
    display: block;
  }

  ${BREAKPOINT_PAD} {
    display: none;
  }
`;

const CartProductsForPad = styled.section`
  display: none;
  margin-bottom: 4rem;

  ${BREAKPOINT_MOBILE} {
    display: none;
  }

  ${BREAKPOINT_PAD} {
    display: block;
  }
`;

const fadeInAnimation = keyframes`${fadeIn}`;
const CartProduct = styled.section`
  position: relative;
  margin-bottom: 4rem;
  animation: 1s ${fadeInAnimation};

  ${BREAKPOINT_PAD} {
    display: flex;
    align-items: center;
  }
`;

const ProductCarousel = styled.div`
  display: flex;
  align-items: center;
`;

const ProductHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  margin-bottom: 1rem;

  ${BREAKPOINT_PAD} {
    margin-top: 0;
  }
`;

const ProductName = styled.h2.attrs(() => ({
  className: "fs-h1",
}))`
  color: ${COLOR_SECONDARY2};
`;

const ProductDeleteButton = styled(trash)`
  width: 2rem;
  height: 2rem;
  cursor: pointer;
`;

const ProductUnderline = styled.div`
  background-color: ${BG_SECONDARY1};
  margin-top: 4rem;
  width: 100%;
  height: 0.4rem;
`;

const NoneCheckedButton = styled(checkNoneFilled)`
  color: ${COLOR_SECONDARY2};
  width: 1.6rem;
  height: 1.6rem;
  margin-right: 0.4rem;
  cursor: pointer;
  z-index: ${Z_INDEX_LV1};

  ${BREAKPOINT_PAD} {
    position: static;
    width: 3.6rem;
    height: 3.6rem;
    margin-right: 0.4rem;
  }
`;

const CheckedButton = styled(checkFilled)`
  color: ${COLOR_SECONDARY2};
  width: 1.6rem;
  height: 1.6rem;
  margin-right: 0.4rem;
  cursor: pointer;
  z-index: ${Z_INDEX_LV1};

  ${BREAKPOINT_PAD} {
    position: static;
    width: 3.6rem;
    height: 3.6rem;
    margin-right: 0.4rem;
  }
`;

const ProductInfo = styled.div`
  width: 80%;
  margin-left: 0.6rem;
`;

const CartProductFlexContainer = styled.section`
  margin-bottom: 4rem;
`;

const StyledSharedTotalPriceShower = styled(SharedTotalPriceShower)`
  margin-bottom: 0;
`;

const StyledSharedSelectionHeader = styled(SharedSelectionHeader)`
  justify-content: space-between;
`;

const CheckedAllButtonContainer = styled.div``;

const CartProductsCheckedBlock = styled.section``;

const ProductButtons = styled.div`
  color: ${COLOR_SECONDARY2};
`;

const LinkButton = styled(linkIcon)`
  width: 2.4rem;
  height: 2.4rem;
  cursor: pointer;
  margin-right: 1rem;
`;

export default function CartPage() {
  // 產生 dispatch
  const dispatch = useReduxDispatch();
  // 從 redux-store拿購物車物品資訊
  const cartItemsFromStore = useReduxSelector((store) => store.cart.items);
  // 透過 react router hook 換頁
  const history = useHistory();
  // pid 不能當作 id 使用，因為合併產品時需要
  // cartForLocal 為本地的購物車內容
  const [cartForLocal, setCartForLocal] = useState(
    cartItemsFromStore.map((product) => ({
      id: product.id,
      pid: product.pid,
      name: product.name,
      slidesForMobile: {
        useForBanner: false,
        frame: {
          maxHeight: "30rem",
          borderRadius: "2rem",
        },
        slide: product.urls.map((url) => ({
          id: url.id,
          src: url.src,
          alt: url.alt,
        })),
      },
      slidesForPad: {
        useForBanner: false,
        frame: {
          maxHeight: "40rem",
          borderRadius: "2rem",
        },
        slide: product.urls.map((url) => ({
          id: url.id,
          src: url.src,
          alt: url.alt,
        })),
      },
      picker: {
        colors: product.colors,
        sizes: product.sizes,
        quantity: product.quantity,
        unitPrice: product.unitPrice,
      },
      selected: false,
    }))
  );
  // 結帳金額
  const [checkedPrice, setCheckedPrice] = useState(0);
  // 若選擇一個或多個購物產品則為 true，反之為 false
  const [singleCheckedState, setSingleCheckedState] = useState(false);
  // 若選擇購物車所有產品則為 true，反之為 false
  const [allCheckedState, setAllCheckedState] = useState(false);
  // 是否顯示合併產品訊息
  const [showMergeProductMsg, setShowMergeProductMsg] = useState(false);
  // 加入詢問合併產品訊息動畫
  const [mergeProductMsgModalInfo] = useState({
    selectionMode: true,
    title: "貼心提醒",
    content: "購物車內有相同規格的產品，是否合併呢？",
  });
  // 是否顯示結帳訊息
  const [showCheckOutMsg, setShowCheckOutMsg] = useState(false);
  // 加入詢問結帳時的訊息動畫
  const [checkOutMsgModalInfo] = useState({
    selectionMode: false,
    title: "尚未開放此功能",
    content: "目前版本還不能結帳扣款，敬請期待",
  });

  // 使用 useRef 暫存目前需要被合併的產品 id
  interface mergeProductIdObject {
    mergeParent: number;
    mergeChild: number;
  }
  const mergeProductId = useRef<null | mergeProductIdObject>(null);

  // 選擇產品顏色
  function handleSelectPickerColor(productId: number, colorId: number): void {
    mergeProductId.current = checkSameProduct(productId, colorId, null);
    // 如果沒有找到相同的產品需要合併的
    if (mergeProductId.current === null) {
      setCartForLocal(
        cartForLocal.map((cartProduct) =>
          cartProduct.id === productId
            ? {
                ...cartProduct,
                picker: {
                  ...cartProduct.picker,
                  colors: cartProduct.picker.colors.map((color) =>
                    color.id === colorId
                      ? { ...color, selected: true }
                      : { ...color, selected: false }
                  ),
                },
              }
            : { ...cartProduct }
        )
      );
    }
    // 如果有則跳出訊息，讓用戶選擇
    else {
      setShowMergeProductMsg(true);
    }
  }
  // 選擇產品尺寸
  function handleSelectPickerSize(productId: number, sizeId: number): void {
    mergeProductId.current = checkSameProduct(productId, null, sizeId);
    // 如果沒有找到相同的產品需要合併的
    if (mergeProductId.current === null) {
      setCartForLocal(
        cartForLocal.map((cartProduct) =>
          cartProduct.id === productId
            ? {
                ...cartProduct,
                picker: {
                  ...cartProduct.picker,
                  sizes: cartProduct.picker.sizes.map((size) =>
                    size.id === sizeId
                      ? { ...size, selected: true }
                      : { ...size, selected: false }
                  ),
                },
              }
            : { ...cartProduct }
        )
      );
    }
    // 如果有則跳出訊息，讓用戶選擇
    else {
      setShowMergeProductMsg(true);
    }
  }
  // 增加產品數量
  function handleIncreaseQuantity(productId: number): void {
    setCartForLocal(
      cartForLocal.map((cartProduct) =>
        cartProduct.id === productId
          ? {
              ...cartProduct,
              picker: {
                ...cartProduct.picker,
                quantity: cartProduct.picker.quantity + 1,
              },
            }
          : { ...cartProduct }
      )
    );
  }
  // 減少產品數量
  function handleDecreaseQuantity(productId: number): void {
    setCartForLocal(
      cartForLocal.map((cartProduct) =>
        cartProduct.id === productId
          ? {
              ...cartProduct,
              picker: {
                ...cartProduct.picker,
                quantity:
                  cartProduct.picker.quantity === 1
                    ? cartProduct.picker.quantity
                    : cartProduct.picker.quantity - 1,
              },
            }
          : { ...cartProduct }
      )
    );
  }
  // 選擇要結帳的產品
  function handleChangeProductSelectedState(productId: number): void {
    setCartForLocal(
      cartForLocal.map((cartProduct) =>
        cartProduct.id === productId
          ? { ...cartProduct, selected: !cartProduct.selected }
          : { ...cartProduct }
      )
    );
  }
  // 刪除購物車中的產品
  function handleDeleteSelectedProduct(productId: number): void {
    setCartForLocal(
      cartForLocal.filter((cartProduct) => cartProduct.id !== productId)
    );
  }
  // 檢查所有產品的選取狀態
  const handleCheckAllSelectedState = useCallback(() => {
    let selectedCounter = 0;
    let allChecked = false;
    let singleChecked = false;
    cartForLocal.forEach((cartProduct) => {
      if (cartProduct.selected) {
        selectedCounter++;
      }
    });

    if (selectedCounter === cartForLocal.length) {
      singleChecked = true;
      allChecked = true;
    }
    if (selectedCounter === 0) {
      singleChecked = false;
      allChecked = false;
    }
    if (selectedCounter >= 1 && selectedCounter !== cartForLocal.length) {
      singleChecked = true;
      allChecked = false;
    }

    return {
      singleChecked,
      allChecked,
    };
  }, [cartForLocal]);
  // 計算所有選取產品的總價格
  const handleCalcAllSelectedProductPrice = useCallback(() => {
    let checkedPrice = 0;
    cartForLocal.forEach((cartProduct) => {
      if (cartProduct.selected) {
        checkedPrice +=
          cartProduct.picker.quantity * cartProduct.picker.unitPrice;
      }
    });
    return checkedPrice;
  }, [cartForLocal]);
  // 點選 "全選" 按鈕事件
  function handleToggleSelectAllProducts(): void {
    const flagCheckedAll = handleCheckAllSelectedState().allChecked;
    setCartForLocal(
      cartForLocal.map((cartProduct) => ({
        ...cartProduct,
        selected: flagCheckedAll === true ? false : true,
      }))
    );
  }
  // 合併相同規格的產品 => 顏色跟尺寸必須一樣
  // mergeParent 代表合併那方，mergeChild 代表被合併那方
  // [注意] 必須保證 mergeProductId.current 一定有 { mergeParent, mergeChild }
  function handleMergeSameProduct(): void {
    // 使用型別斷言確定一定有 { mergeParent, mergeChild } 物件傳進來
    const { mergeParent, mergeChild } =
      mergeProductId.current as mergeProductIdObject;
    let quantityOfChild = cartForLocal.filter(
      (product) => product.id === mergeChild
    )[0].picker.quantity;
    let newCartForLocal = cartForLocal
      .filter((product) => product.id !== mergeChild)
      .map((product) =>
        product.id === mergeParent
          ? {
              ...product,
              // id: cartForLocal.length + 1,
              picker: {
                ...product.picker,
                quantity: product.picker.quantity + quantityOfChild,
              },
            }
          : { ...product }
      );
    setCartForLocal(newCartForLocal);
    setShowMergeProductMsg(false);
  }

  // 尋找購物車內是否存在相同的規格的產品 => 顏色跟尺寸必須一樣
  // 如果找到可以合併的產品，回傳 mergeParent 代表合併那方，mergeChild 代表被合併那方
  // 沒有可合併的產品則回傳 undefined
  interface searchedProduct {
    pid: null | number;
    color: null | string;
    size: null | string;
  }
  function checkSameProduct(
    productId: number,
    selectedColorId: number | null,
    selectedSizeId: number | null
  ): null | mergeProductIdObject {
    const searchedProduct: searchedProduct = {
      pid: null,
      color: null,
      size: null,
    };
    // 根據 productId 拿到要搜尋的 pid, color, size
    for (let i = 0; i < cartForLocal.length; i++) {
      if (cartForLocal[i].id === productId) {
        searchedProduct.pid = cartForLocal[i].pid;
        // 代表用戶點選 size，color 欄位必須從 cartForLocal 拿，size 則從給定的 selectedSizeId 拿
        if (selectedColorId === null) {
          searchedProduct.color = cartForLocal[i].picker.colors.filter(
            (color) => color.selected
          )[0].hexcode;
          searchedProduct.size = cartForLocal[i].picker.sizes.filter(
            (size) => size.id === selectedSizeId
          )[0].name;
        }
        // 代表用戶點選 color，size 欄位必須從 cartForLocal 拿，color 則從給定的 selectedColorId 拿
        if (selectedSizeId === null) {
          searchedProduct.color = cartForLocal[i].picker.colors.filter(
            (color) => color.id === selectedColorId
          )[0].hexcode;
          searchedProduct.size = cartForLocal[i].picker.sizes.filter(
            (size) => size.selected
          )[0].name;
        }
      }
    }
    // 搜尋原本產品以外的產品，確認規格是否有相同
    for (let i = 0; i < cartForLocal.length; i++) {
      if (cartForLocal[i].id !== productId) {
        if (cartForLocal[i].pid === searchedProduct.pid) {
          if (
            cartForLocal[i].picker.colors.filter((color) => color.selected)[0]
              .hexcode === searchedProduct.color
          ) {
            if (
              cartForLocal[i].picker.sizes.filter((size) => size.selected)[0]
                .name === searchedProduct.size
            ) {
              return {
                mergeParent: cartForLocal[i].id,
                mergeChild: productId,
              };
            }
          }
        }
      }
    }
    return null;
  }
  // 導引到產品相關頁面
  function handleRedirectToProductPage(pid: number): void {
    history.push(`/product/${pid}`);
  }

  // cartForLocal 更新時，同步更新 cart 內容
  useEffect(() => {
    dispatch(
      addCartItem(
        cartForLocal.map((cartProduct) => ({
          id: cartProduct.id,
          pid: cartProduct.pid,
          name: cartProduct.name,
          // slidesForMobile 跟 slidesForPad 的 slide 都是一樣，則一傳入即可
          urls: cartProduct.slidesForMobile.slide.map((item) => ({
            id: item.id,
            src: item.src,
            alt: item.alt,
          })),
          colors: cartProduct.picker.colors,
          sizes: cartProduct.picker.sizes,
          quantity: cartProduct.picker.quantity,
          unitPrice: cartProduct.picker.unitPrice,
        }))
      )
    );
  }, [cartForLocal, dispatch]);
  // cartForLocal 更新時，更新總金額、商品選取狀態
  useEffect(() => {
    setCheckedPrice(handleCalcAllSelectedProductPrice());
    setSingleCheckedState(handleCheckAllSelectedState().singleChecked);
    setAllCheckedState(handleCheckAllSelectedState().allChecked);
  }, [
    cartForLocal,
    dispatch,
    handleCalcAllSelectedProductPrice,
    handleCheckAllSelectedState,
  ]);

  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        {cartForLocal.length ? (
          <>
            <CartTitle>購物袋中商品</CartTitle>
            <CartProductsForMobile>
              {cartForLocal.map((cartProduct) => (
                <CartProduct key={cartProduct.id}>
                  <ProductCarousel>
                    {!cartProduct.selected && (
                      <NoneCheckedButton
                        onClick={() => {
                          handleChangeProductSelectedState(cartProduct.id);
                        }}
                      />
                    )}
                    {cartProduct.selected && (
                      <CheckedButton
                        onClick={() => {
                          handleChangeProductSelectedState(cartProduct.id);
                        }}
                      />
                    )}
                    <BSCarousel slides={cartProduct.slidesForMobile} />
                  </ProductCarousel>
                  <ProductHeader>
                    <ProductName>{cartProduct.name}</ProductName>
                    <ProductButtons>
                      <LinkButton
                        onClick={() => {
                          handleRedirectToProductPage(cartProduct.pid);
                        }}
                      />
                      <ProductDeleteButton
                        onClick={() => {
                          handleDeleteSelectedProduct(cartProduct.id);
                        }}
                      />
                    </ProductButtons>
                  </ProductHeader>
                  <CartPicker
                    picker={cartProduct.picker}
                    productId={cartProduct.id}
                    handleSelectPickerColor={handleSelectPickerColor}
                    handleSelectPickerSize={handleSelectPickerSize}
                    handleIncreaseQuantity={handleIncreaseQuantity}
                    handleDecreaseQuantity={handleDecreaseQuantity}
                  />
                  <ProductUnderline></ProductUnderline>
                </CartProduct>
              ))}
              <FixedOffcanva
                totalPrice={checkedPrice}
                singleCheckedState={singleCheckedState}
                allCheckedState={allCheckedState}
                handleToggleSelectAllProducts={handleToggleSelectAllProducts}
                handleCheckOut={() => {
                  setShowCheckOutMsg(true);
                }}
              />
            </CartProductsForMobile>
            <CartProductsForPad>
              {cartForLocal.map((cartProduct) => (
                <CartProductFlexContainer key={cartProduct.id}>
                  <CartProduct key={cartProduct.id}>
                    {!cartProduct.selected && (
                      <NoneCheckedButton
                        onClick={() => {
                          handleChangeProductSelectedState(cartProduct.id);
                        }}
                      />
                    )}
                    {cartProduct.selected && (
                      <CheckedButton
                        onClick={() => {
                          handleChangeProductSelectedState(cartProduct.id);
                        }}
                      />
                    )}
                    <BSCarousel slides={cartProduct.slidesForPad} />
                    <ProductInfo>
                      <ProductHeader>
                        <ProductName>{cartProduct.name}</ProductName>
                        <ProductButtons>
                          <LinkButton
                            onClick={() => {
                              handleRedirectToProductPage(cartProduct.pid);
                            }}
                          />
                          <ProductDeleteButton
                            onClick={() => {
                              handleDeleteSelectedProduct(cartProduct.id);
                            }}
                          />
                        </ProductButtons>
                      </ProductHeader>
                      <CartPicker
                        picker={cartProduct.picker}
                        productId={cartProduct.id}
                        handleSelectPickerColor={handleSelectPickerColor}
                        handleSelectPickerSize={handleSelectPickerSize}
                        handleIncreaseQuantity={handleIncreaseQuantity}
                        handleDecreaseQuantity={handleDecreaseQuantity}
                      />
                    </ProductInfo>
                  </CartProduct>
                  <ProductUnderline></ProductUnderline>
                </CartProductFlexContainer>
              ))}
              <CartProductsCheckedBlock>
                <StyledSharedSelectionHeader>
                  <CheckedAllButtonContainer>
                    {allCheckedState ? (
                      <SharedCheckedAllButton
                        onClick={() => {
                          handleToggleSelectAllProducts();
                        }}
                      />
                    ) : (
                      <SharedNoneCheckedButton
                        onClick={() => {
                          handleToggleSelectAllProducts();
                        }}
                      />
                    )}
                    全選
                  </CheckedAllButtonContainer>
                  <StyledSharedTotalPriceShower>
                    總金額：NTD {checkedPrice}
                  </StyledSharedTotalPriceShower>
                </StyledSharedSelectionHeader>
                {singleCheckedState ? (
                  <CTAPrimaryButton
                    margin={"0 0 0 auto"}
                    width={"16rem"}
                    isRounded={true}
                    onClick={() => {
                      setShowCheckOutMsg(true);
                    }}
                  >
                    結帳去
                  </CTAPrimaryButton>
                ) : (
                  <CTASecondaryButton
                    margin={"0 0 0 auto"}
                    width={"16rem"}
                    isRounded={true}
                  >
                    沒有物品可結帳
                  </CTASecondaryButton>
                )}
              </CartProductsCheckedBlock>
            </CartProductsForPad>
          </>
        ) : (
          <>
            <CartTitle margin={"2rem 0 2rem 0"} textAlign={true}>
              購物車還是空的
            </CartTitle>
            <CartSubTitle>現在就去 shopping 吧</CartSubTitle>
            <CTAPrimaryButton
              isRounded={true}
              margin={"1rem auto 0"}
              onClick={() => {
                history.push("/");
              }}
            >
              回首頁
            </CTAPrimaryButton>
          </>
        )}
      </ContentContainer>
      {/* 這是用來提醒用戶是否要合併相同產品的訊息 */}
      {showMergeProductMsg && (
        <Modal
          modalInfo={mergeProductMsgModalInfo}
          handleSubmitOp={handleMergeSameProduct}
          handleCancelOp={() => setShowMergeProductMsg(false)}
        />
      )}
      {showCheckOutMsg && (
        <Modal
          modalInfo={checkOutMsgModalInfo}
          handleSubmitOp={() => setShowCheckOutMsg(false)}
          handleCancelOp={() => setShowCheckOutMsg(false)}
        />
      )}
      <Footer marginBottom={"10rem"} />
    </PageContainer>
  );
}
