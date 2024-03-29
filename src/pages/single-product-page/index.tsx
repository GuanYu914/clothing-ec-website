import Header from "../../components/header";
import Footer from "../../components/footer";
import styled from "styled-components/macro";
import BSCarousel from "../../components/bs-carousel";
import CardContainer from "../../components/card-container";
import ProductPicker from "../../components/product-picker";
import { useEffect, useState } from "react";
import { ReactComponent as heart } from "../../imgs/pages/single-product-page/heart.svg";
import { ReactComponent as heartFilled } from "../../imgs/pages/single-product-page/heart-fill.svg";
import {
  BREAKPOINT_MOBILE,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_PAD,
  HEADER_HEIGHT_MOBILE,
  HEADER_HEIGHT_PAD,
  MAX_CONTAINER_WIDTH,
  Z_INDEX_LV2,
  COLOR_SECONDARY2,
  COLOR_SECONDARY3,
  BG_PRIMARY1,
  BG_SECONDARY4,
  COLOR_PRIMARY2,
  API_RESP_FAILED_MSG,
  API_RESP_SERVER_REJECT_OP_MSG,
  API_RESP_SUCCESSFUL_MSG,
  API_RESP_REQ_REJECT_ERR_MSG,
} from "../../constant";
import { useHistory, useParams } from "react-router";
import { getProductByIDApi } from "../../Webapi";
import Loader from "../../components/loader";
import Modal from "../../components/modal";
import FlashModal from "../../components/flash-modal";
import { isEmptyObj } from "../../util";
import {
  addWatchedItem,
  toggleItemLikedState,
} from "../../redux/reducers/watchedItemsSlice";
import { addCartItem } from "../../redux/reducers/cartSlice";
import {
  addFavoriteItem,
  removeFavoriteItem,
} from "../../redux/reducers/FavoriteItemsSlice";
import { useReduxDispatch, useReduxSelector } from "../../redux/store";
import {
  ProductSlidesStatePayload,
  ProductStatePayload,
  ProductByIdAPIRespPayload,
  SizesOfProductByIdAPIRespPayload,
  ColorsOfProductByIdAPIRespPayload,
  UseParamsHookPayload,
} from "./types";

const PageContainer = styled.div`
  background-color: ${BG_SECONDARY4};
`;
const ContentContainer = styled.main`
  // 定義容器最大寬度
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
  // 大於 1440px 寬度時，改變左右 padding
  ${BREAKPOINT_LAPTOP} {
    padding-left: 2rem;
    padding-right: 2rem;
  }
`;

const ProductCategoryPath = styled.h3.attrs(() => ({
  className: "fs-h3",
}))`
  color: ${COLOR_SECONDARY2};
  padding-top: 1rem;
  margin-bottom: 1rem;
  // 根據不同裝置寬度預設跟 Header 保持 margin-top: 0
  ${BREAKPOINT_MOBILE} {
    margin-top: calc(${HEADER_HEIGHT_MOBILE});
  }

  ${BREAKPOINT_PAD} {
    margin-top: calc(${HEADER_HEIGHT_PAD});
  }
`;

const ProductInfoForMobile = styled.section`
  display: block;

  ${BREAKPOINT_MOBILE} {
    display: block;
  }

  ${BREAKPOINT_PAD} {
    display: none;
  }
`;

const ProductInfoContainer = styled.section`
  color: ${COLOR_SECONDARY2};
  margin-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${BREAKPOINT_PAD} {
    display: block;
    margin-top: 0;
    flex-grow: 1;
    padding-left: 0.8rem;
  }
`;

const ProductHeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ProductName = styled.h1.attrs(() => ({
  className: "fs-h1",
}))`
  color: ${COLOR_SECONDARY2};
`;

const FavoriteIcon = styled(heart)`
  width: 2.4rem;
  height: 2.4rem;
  margin-left: 1rem;
  cursor: pointer;
`;

const FavoriteFilledIcon = styled(heartFilled)`
  color: ${COLOR_PRIMARY2};
  width: 2.4rem;
  height: 2.4rem;
  margin-left: 1rem;
  cursor: pointer;
`;

const DetailInfoContainer = styled.section`
  margin-top: 3rem;
`;

const DetailInfoTitle = styled.h1.attrs(() => ({
  className: "fs-h2",
}))`
  color: ${COLOR_SECONDARY2};
`;

const DetailInfoDescBlock = styled.section`
  margin-top: 1rem;
`;

const DetailInfoDescBlockSubTitle = styled.h2.attrs(() => ({
  className: "fs-h2",
}))`
  color: ${COLOR_SECONDARY2};
`;

const DetailInfoDescBlockBody = styled.h3.attrs(() => ({
  className: "fs-h3",
}))`
  color: ${COLOR_SECONDARY2};
  margin-bottom: 2rem;
`;

const ProductInfoContainerForPad = styled.section`
  display: none;

  ${BREAKPOINT_MOBILE} {
    display: none;
  }

  ${BREAKPOINT_PAD} {
    display: flex;
  }
`;

const WatchedItemsContainer = styled.section`
  margin-top: 2rem;
`;

const WatchedItemsTitle = styled.h2.attrs(() => ({
  className: "fs-h2",
}))`
  color: ${COLOR_SECONDARY2};
`;

const ProductAddButton = styled.div.attrs(() => ({
  className: "fs-h2",
}))`
  color: ${COLOR_SECONDARY3};
  background-color: ${BG_PRIMARY1};
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rem;
  line-height: 4rem;
  text-align: center;
  cursor: pointer;
  box-shadow: rgba(0, 0, 0, 0.04) 0px -3px 5px;
  z-index: ${Z_INDEX_LV2};

  ${BREAKPOINT_PAD} {
    display: none;
  }
`;

export default function SingleProductPage() {
  // 產生 redux-dispatch
  const dispatch = useReduxDispatch();
  // 從 redux-store 撈出產品觀看歷史紀錄清單
  const watchedItemsFromStore = useReduxSelector(
    (store) => store.watchedItems.items
  );
  // 從 redux-store 拿出購物車物品清單
  const cartItemsFromStore = useReduxSelector((store) => store.cart.items);
  // 從 redux-store 拿喜好清單
  const favoriteItemsFromStore = useReduxSelector(
    (store) => store.favoriteItems.items
  );
  // 透過 React router hook 拿到特定網址資訊
  const { productID } = useParams<UseParamsHookPayload>();
  // 透過此 hook 換頁
  const history = useHistory();
  // 從 redux-store 拿用戶資訊
  const userFromStore = useReduxSelector((store) => store.user.info);
  //  產品資訊讀取狀態
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  // 已看過產品清單讀取狀態
  const [isLoadingWatchedProducts, setIsLoadingWatchedProducts] =
    useState(true);
  // 頁面產品資訊
  const [productInfo, setProductInfo] = useState<ProductStatePayload>({
    id: 0,
    category: {
      base: "",
      main: "",
      sub: "",
      detailed: "",
    },
    name: "",
    detail: {
      size: "",
      shipment: "",
      cleanness: "",
    },
    imgs: [],
    picker: {
      sizes: [],
      colors: [],
      quantity: 0,
      unitPrice: 0,
    },
    isLiked: false,
  });
  // 產品幻燈片，根據螢幕寬度給不同 props 到 BSCarousel 元件
  const [slidesForMobile, setSlidesForMobile] =
    useState<ProductSlidesStatePayload>({
      useForBanner: false,
      frame: {
        maxHeight: "30rem",
        borderRadius: "2rem",
      },
      slide: [],
    });
  const [slidesForPad, setSlidesForPad] = useState<ProductSlidesStatePayload>({
    useForBanner: false,
    frame: {
      maxHeight: "40rem",
      borderRadius: "2rem",
    },
    slide: [],
  });
  // 顯示產品分類路徑名稱
  const [displayedCategoryPath, setDisplayedCategoryPath] = useState("");
  // mobile 裝置底下， product-picker 元件啟用狀態
  const [mobilePickerState, setMobilePickerState] = useState(false);
  // 當前頁面可以被執行有關購物車相關的操作狀態
  const [activeOpState, setActiveOpState] = useState(false);
  // 是否要顯示加入購物車的動畫
  const [showAddToCartReminder, setShowAddToCartReminder] = useState(false);
  // // 是否要顯示選擇顏色跟尺寸的動畫
  const [showSelectNecessaryOptions, setShowSelectNecessaryOptions] =
    useState(false);
  // 是否要顯示 api 發送錯誤的 modal
  const [showModalForApiError, setShowModalForApiError] = useState(false);
  // api 發送錯誤的 modal 資訊
  const [modalInfoForApiError] = useState({
    selectionMode: false,
    title: "發生一點小錯誤",
    content: "由於伺服器或網路異常，請稍後再試一次",
  });

  // mobile 裝置下，點選 "選擇商品規格" 事件
  function handleSelectProductSpecOnMobile(): void {
    // 重設所有先前用戶點選的選項
    setProductInfo({
      ...productInfo,
      picker: {
        ...productInfo.picker,
        colors: productInfo.picker.colors.map((color) => ({
          ...color,
          selected: false,
        })),
        sizes: productInfo.picker.sizes.map((size) => ({
          ...size,
          selected: false,
        })),
        quantity: 1,
      },
    });
    // 叫出 mobile 裝置底下的 product-picker 元件
    setMobilePickerState(true);
  }
  // 更新當前頁面愛心狀態
  function handleAddToLikedItems(): void {
    // 更新當前頁面愛心狀態
    setProductInfo({ ...productInfo, isLiked: !productInfo.isLiked });
    // 透過當前頁面愛心狀態，更新用戶收藏清單跟產品觀看歷史紀錄清單的愛心狀態
    if (!productInfo.isLiked) {
      dispatch(
        addFavoriteItem([
          {
            ...productInfo,
            product: {
              name: productInfo.name,
              price: `${productInfo.picker.unitPrice}`,
              img: productInfo.imgs[0].src,
            },
            isLiked: true,
          },
          ...favoriteItemsFromStore,
        ])
      );
    } else {
      dispatch(removeFavoriteItem({ pid: productInfo.id }));
    }
    dispatch(
      toggleItemLikedState({
        pid: productInfo.id,
      })
    );
  }
  // 選擇商品顏色
  function handleSelectPickerColor(id: number): void {
    setProductInfo({
      ...productInfo,
      picker: {
        ...productInfo.picker,
        colors: productInfo.picker.colors.map((color) =>
          color.id === id
            ? { ...color, selected: true }
            : { ...color, selected: false }
        ),
      },
    });
  }
  // 選擇商品尺寸
  function handleSelectPickerSize(id: number): void {
    setProductInfo({
      ...productInfo,
      picker: {
        ...productInfo.picker,
        sizes: productInfo.picker.sizes.map((size) =>
          size.id === id
            ? { ...size, selected: true }
            : { ...size, selected: false }
        ),
      },
    });
  }
  // 增加購買數量
  function handleIncreaseQuantity(): void {
    setProductInfo({
      ...productInfo,
      picker: {
        ...productInfo.picker,
        quantity: productInfo.picker.quantity + 1,
      },
    });
  }
  // 減少購買數量
  function handleDecreaseQuantity(): void {
    if (productInfo.picker.quantity === 1) return;
    setProductInfo({
      ...productInfo,
      picker: {
        ...productInfo.picker,
        quantity: productInfo.picker.quantity - 1,
      },
    });
  }
  // 檢查當前狀態使否可以點選 "直接購買" 跟 "加入購物車" 按鈕
  function checkActiveState(): boolean {
    let colorChecked = false;
    let sizeChecked = false;
    for (let i = 0; i < productInfo.picker.colors.length; i++) {
      if (productInfo.picker.colors[i].selected) {
        colorChecked = true;
        break;
      }
    }
    for (let j = 0; j < productInfo.picker.sizes.length; j++) {
      if (productInfo.picker.sizes[j].selected) {
        sizeChecked = true;
        break;
      }
    }
    return colorChecked && sizeChecked;
  }
  // 點選 "加入購物車" 按鈕
  function handleAddToCart(
    isSelected: boolean,
    selectedPickerColor?: string,
    selectedPickerSize?: string
  ): void {
    if (!isSelected) {
      // 顯示選擇 color & size 動畫
      setShowSelectNecessaryOptions(true);
      return;
    }
    // 找尋購物車內是否有一樣產品規格
    let flagFind = false;
    for (let i = 0; i < cartItemsFromStore.length; i++) {
      if (cartItemsFromStore[i].pid === productInfo.id) {
        if (
          cartItemsFromStore[i].colors.filter((color) => color.selected)[0]
            .hexcode === selectedPickerColor
        ) {
          if (
            cartItemsFromStore[i].sizes.filter((size) => size.selected)[0]
              .name === selectedPickerSize
          ) {
            // 找到一樣規格的產品，更新該產品目前數量
            dispatch(
              addCartItem(
                cartItemsFromStore.map((item, index) =>
                  index === i
                    ? {
                        ...item,
                        quantity: item.quantity + productInfo.picker.quantity,
                      }
                    : {
                        ...item,
                      }
                )
              )
            );
            flagFind = true;
            break;
          }
        }
      }
    }
    // 未找到相同規格的產品，新增到購物車頂端
    if (!flagFind) {
      // 尋找購物車產品最大的 id
      let maxProductId = cartItemsFromStore.length
        ? cartItemsFromStore[0].id
        : cartItemsFromStore.length;
      for (let i = 0; i < cartItemsFromStore.length; i++) {
        if (cartItemsFromStore[i].id > maxProductId) {
          maxProductId = cartItemsFromStore[i].id;
        }
      }
      // 複製 cart 內容，但 ref 不一樣，造成 react 去更新
      dispatch(
        addCartItem([
          {
            id: maxProductId + 1,
            pid: productInfo.id,
            name: productInfo.name,
            urls: productInfo.imgs,
            colors: productInfo.picker.colors,
            sizes: productInfo.picker.sizes,
            quantity: productInfo.picker.quantity,
            unitPrice: productInfo.picker.unitPrice,
          },
          ...cartItemsFromStore,
        ])
      );
    }
    // 顯示加入購物車訊息動畫
    setShowAddToCartReminder(true);
  }
  // 點選 "直接購買" 按鈕
  function handleCheckout(
    isSelected: boolean,
    selectedPickerColor?: string,
    selectedPickerSize?: string
  ): void {
    if (!isSelected) {
      // 顯示加入 color & size 動畫
      setShowSelectNecessaryOptions(true);
      return;
    }
    // 加入到購物車且導引到 cart page
    handleAddToCart(true, selectedPickerColor, selectedPickerSize);
    history.push("/cart");
  }
  // 更新 watchedItems 裡面物件的 isLiked 屬性
  function handleUpdateItemLikedState(id: number): void {
    // 更新 watchedItems 裡面物件的 isLiked 屬性
    dispatch(
      toggleItemLikedState({
        pid: id,
      })
    );
    // 根據 watchedItems 裡面的 isLiked 屬性，同步更新用戶收藏清單跟產品觀看歷史紀錄清單的愛心狀態
    watchedItemsFromStore.forEach((el) => {
      if (el.id === id) {
        if (!el.isLiked) {
          dispatch(
            addFavoriteItem([
              { ...el, isLiked: true },
              ...favoriteItemsFromStore,
            ])
          );
          setProductInfo({
            ...productInfo,
            isLiked: true,
          });
        } else {
          dispatch(removeFavoriteItem({ pid: id }));
          setProductInfo({
            ...productInfo,
            isLiked: false,
          });
        }
      }
    });
  }
  // 拿產品相關資訊，並設置相關狀態
  function getProductInfoFromApi(id: number): void {
    setIsLoadingProduct(true);
    getProductByIDApi(id)
      .then((resp) => {
        const json_data = resp.data;
        if (json_data.isSuccessful === API_RESP_FAILED_MSG) {
          console.log(API_RESP_SERVER_REJECT_OP_MSG, json_data);
          setShowModalForApiError(true);
        }
        if (json_data.isSuccessful === API_RESP_SUCCESSFUL_MSG) {
          const json_data_for_product: ProductByIdAPIRespPayload =
            resp.data.data[0];
          setProductInfo({
            id: json_data_for_product.pid, // 將 pid 當作 productInfo.id
            category: JSON.parse(json_data_for_product.category),
            name: json_data_for_product.name,
            detail: JSON.parse(json_data_for_product.detail),
            imgs: JSON.parse(json_data_for_product.imgs),
            picker: {
              sizes: JSON.parse(json_data_for_product.sizes).map(
                (size: SizesOfProductByIdAPIRespPayload) => ({
                  ...size,
                  selected: false,
                })
              ),
              colors: JSON.parse(json_data_for_product.colors).map(
                (color: ColorsOfProductByIdAPIRespPayload) => ({
                  ...color,
                  selected: false,
                })
              ),
              quantity: 1,
              unitPrice: json_data_for_product.price,
            },
            isLiked: checkIfUserLikeTheProduct(json_data_for_product.pid),
          });
          setSlidesForMobile({
            ...slidesForMobile,
            slide: JSON.parse(json_data_for_product.imgs),
          });
          setSlidesForPad({
            ...slidesForPad,
            slide: JSON.parse(json_data_for_product.imgs),
          });
          // dispatch action to watchedItemsReducer
          dispatch(
            addWatchedItem({
              pid: json_data_for_product.pid,
              item: {
                id: json_data_for_product.pid,
                product: {
                  name: json_data_for_product.name,
                  price: `${json_data_for_product.price}`,
                  img: JSON.parse(json_data_for_product.imgs)[0].src,
                },
                isLiked: checkIfUserLikeTheProduct(json_data_for_product.pid),
              },
            })
          );
          setIsLoadingProduct(false);
        }
      })
      .catch((e) => {
        console.log(API_RESP_REQ_REJECT_ERR_MSG, e);
        setShowModalForApiError(true);
      });
  }
  // 拿到產品所在分類目錄
  function getCategoryPathOfProduct() {
    let categoryPath = "";
    if (productInfo.category.base !== "none") {
      categoryPath += productInfo.category.base;
    }
    if (productInfo.category.main !== "none") {
      categoryPath += " > " + productInfo.category.main;
    }
    if (productInfo.category.sub !== "none") {
      categoryPath += " > " + productInfo.category.sub;
    }
    if (productInfo.category.detailed !== "none") {
      categoryPath += " > " + productInfo.category.detailed;
    }
    return categoryPath;
  }
  // 導引到相對應的產品頁面
  function handleRedirectToProductPage(
    e: React.MouseEvent<HTMLElement, MouseEvent>
  ): void {
    const el = e.target as HTMLElement;
    const id = el.getAttribute("data-id");
    history.push(`/product/${id}`);
  }
  // modal 顯示情境: api 發送過程中有誤
  // 處理點選按鈕事件
  function handleSubmitOpForApiError(): void {
    setShowModalForApiError(false);
  }
  // modal 顯示情境: api 發送過程中有誤
  // 處理點選按鈕之外事件
  function handleCancelOpForApiError(): void {
    setShowModalForApiError(false);
  }
  // 傳入 product 的 id，並根據當前用戶的收藏清單，回傳是否喜歡此產品
  function checkIfUserLikeTheProduct(id: number): boolean {
    if (isEmptyObj(userFromStore)) return false;
    for (let i = 0; i < favoriteItemsFromStore.length; i++) {
      if (favoriteItemsFromStore[i].id === id) return true;
    }
    return false;
  }

  // 如果 picker 有被點選，且不是正在讀取中，則更新目前購物操作狀態
  useEffect(() => {
    if (!isLoadingProduct) {
      setActiveOpState(checkActiveState());
    }
    // eslint-disable-next-line
  }, [productInfo.picker]);
  // 若產品狀態讀取完畢，則更新分類路徑名稱
  useEffect(() => {
    if (!isLoadingProduct) {
      setDisplayedCategoryPath(getCategoryPathOfProduct());
    }
    // eslint-disable-next-line
  }, [isLoadingProduct]);
  // URL 格式 : /product/:productID
  // 如果頁面的 productID 變動時，則抓取相對應的產品資訊
  useEffect(() => {
    getProductInfoFromApi(Number(productID));
    // eslint-disable-next-line
  }, [productID]);
  // 如果產品資訊得取完畢而且 store 裡面的 watchedItems 不為空，就顯示近期看過商品
  useEffect(() => {
    if (!isLoadingProduct) {
      if (watchedItemsFromStore.length) {
        setIsLoadingWatchedProducts(false);
      }
    }
  }, [isLoadingProduct, watchedItemsFromStore]);
  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        {isLoadingProduct ? (
          <Loader marginTop={"0"} />
        ) : (
          <>
            <ProductCategoryPath>{displayedCategoryPath}</ProductCategoryPath>
            <ProductInfoForMobile>
              <BSCarousel slides={slidesForMobile} />
              <ProductInfoContainer>
                <ProductName>{productInfo.name}</ProductName>
                {!isEmptyObj(userFromStore) && (
                  <>
                    {productInfo.isLiked ? (
                      <FavoriteFilledIcon onClick={handleAddToLikedItems} />
                    ) : (
                      <FavoriteIcon onClick={handleAddToLikedItems} />
                    )}
                  </>
                )}
              </ProductInfoContainer>
              <DetailInfoContainer>
                <DetailInfoTitle>詳細資訊</DetailInfoTitle>
                <DetailInfoDescBlock>
                  <DetailInfoDescBlockSubTitle>
                    產品尺碼
                  </DetailInfoDescBlockSubTitle>
                  <DetailInfoDescBlockBody>
                    {productInfo.detail.size}
                  </DetailInfoDescBlockBody>
                  <DetailInfoDescBlockSubTitle>
                    運費注意事項
                  </DetailInfoDescBlockSubTitle>
                  <DetailInfoDescBlockBody>
                    {productInfo.detail.shipment}
                  </DetailInfoDescBlockBody>
                  <DetailInfoDescBlockSubTitle>
                    清潔須知
                  </DetailInfoDescBlockSubTitle>
                  <DetailInfoDescBlockBody>
                    {productInfo.detail.cleanness}
                  </DetailInfoDescBlockBody>
                </DetailInfoDescBlock>
              </DetailInfoContainer>
            </ProductInfoForMobile>
            <ProductInfoContainerForPad>
              <BSCarousel slides={slidesForPad} />
              <ProductInfoContainer>
                <ProductHeaderContainer>
                  <ProductName>{productInfo.name}</ProductName>
                  {!isEmptyObj(userFromStore) && (
                    <>
                      {productInfo.isLiked ? (
                        <FavoriteFilledIcon onClick={handleAddToLikedItems} />
                      ) : (
                        <FavoriteIcon onClick={handleAddToLikedItems} />
                      )}
                    </>
                  )}
                </ProductHeaderContainer>
                <ProductPicker
                  picker={productInfo.picker}
                  usedOnPad={true}
                  handleSelectPickerColor={handleSelectPickerColor}
                  handleSelectPickerSize={handleSelectPickerSize}
                  handleIncreaseQuantity={handleIncreaseQuantity}
                  handleDecreaseQuantity={handleDecreaseQuantity}
                  activeOpState={activeOpState}
                  setMobilePickerState={handleSelectProductSpecOnMobile}
                  isLiked={productInfo.isLiked}
                  handleAddToLikedItems={handleAddToLikedItems}
                  handleAddToCart={handleAddToCart}
                  handleCheckout={handleCheckout}
                />
                <DetailInfoContainer>
                  <DetailInfoTitle>詳細資訊</DetailInfoTitle>
                  <DetailInfoDescBlock>
                    <DetailInfoDescBlockSubTitle>
                      產品尺碼
                    </DetailInfoDescBlockSubTitle>
                    <DetailInfoDescBlockBody>
                      {productInfo.detail.size}
                    </DetailInfoDescBlockBody>
                    <DetailInfoDescBlockSubTitle>
                      運費注意事項
                    </DetailInfoDescBlockSubTitle>
                    <DetailInfoDescBlockBody>
                      {productInfo.detail.shipment}
                    </DetailInfoDescBlockBody>
                    <DetailInfoDescBlockSubTitle>
                      清潔須知
                    </DetailInfoDescBlockSubTitle>
                    <DetailInfoDescBlockBody>
                      {productInfo.detail.cleanness}
                    </DetailInfoDescBlockBody>
                  </DetailInfoDescBlock>
                </DetailInfoContainer>
              </ProductInfoContainer>
            </ProductInfoContainerForPad>
          </>
        )}
        {isLoadingWatchedProducts ? (
          <Loader marginTop={"0"} />
        ) : (
          <WatchedItemsContainer>
            <WatchedItemsTitle>近期看過的商品</WatchedItemsTitle>
            <CardContainer
              items={watchedItemsFromStore}
              handleLiked={handleUpdateItemLikedState}
              handleOnClick={handleRedirectToProductPage}
              marginLeft={"0"}
              useForLikedItem={true}
            />
          </WatchedItemsContainer>
        )}
      </ContentContainer>
      {/* 這是 mobile 裝置上的底部按鈕 */}
      <ProductAddButton onClick={handleSelectProductSpecOnMobile}>
        選擇商品規格
      </ProductAddButton>
      {mobilePickerState && (
        // 適用於 mobile breakpoint
        <ProductPicker
          name={productInfo.name}
          picker={productInfo.picker}
          usedOnMobile={true}
          handleSelectPickerColor={handleSelectPickerColor}
          handleSelectPickerSize={handleSelectPickerSize}
          handleIncreaseQuantity={handleIncreaseQuantity}
          handleDecreaseQuantity={handleDecreaseQuantity}
          activeOpState={activeOpState}
          setMobilePickerState={setMobilePickerState}
          isLiked={productInfo.isLiked}
          handleAddToLikedItems={handleAddToLikedItems}
          handleAddToCart={handleAddToCart}
          handleCheckout={handleCheckout}
        />
      )}
      {/* 這是用來提醒用戶商品被加入購物車的訊息 */}
      <FlashModal
        showReminderFromProp={showAddToCartReminder}
        msg={"已經加入購物車"}
        handleSyncPropState={(value: boolean) =>
          setShowAddToCartReminder(value)
        }
      />
      {/* 這是用來提醒用戶還沒點選顏色跟尺寸的訊息 */}
      <FlashModal
        showReminderFromProp={showSelectNecessaryOptions}
        msg={"請先選擇顏色跟尺寸"}
        handleSyncPropState={(value: boolean) =>
          setShowSelectNecessaryOptions(value)
        }
      />
      {showModalForApiError && (
        <Modal
          modalInfo={modalInfoForApiError}
          handleSubmitOp={handleSubmitOpForApiError}
          handleCancelOp={handleCancelOpForApiError}
        />
      )}
      <Footer marginTop="6rem" marginBottom="4rem" />
    </PageContainer>
  );
}
