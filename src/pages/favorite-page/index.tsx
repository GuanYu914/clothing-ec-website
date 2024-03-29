import React from "react";
import styled from "styled-components/macro";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
  BREAKPOINT_MOBILE,
  BREAKPOINT_PAD,
  HEADER_HEIGHT_MOBILE,
  HEADER_HEIGHT_PAD,
  MAX_CONTAINER_WIDTH,
  COLOR_SECONDARY2,
  BG_SECONDARY4,
} from "../../constant";
import CardContainer from "../../components/card-container";
import { useState } from "react";
import { useEffect, useRef } from "react";
import Modal from "../../components/modal";
import { CTAPrimaryButton } from "../../components/button";
import { useHistory } from "react-router";
import { addFavoriteItem } from "../../redux/reducers/FavoriteItemsSlice";
import { useReduxDispatch, useReduxSelector } from "../../redux/store";

const PageContainer = styled.div`
  background-color: ${BG_SECONDARY4};
`;
const ContentContainer = styled.main`
  // 設定容器最大寬度
  max-width: ${MAX_CONTAINER_WIDTH};
  margin-left: auto;
  margin-right: auto;

  // 從頁面頂端計算 Header Component 目前的高度，並從這當作起點開始 render
  ${BREAKPOINT_MOBILE} {
    margin-top: ${HEADER_HEIGHT_MOBILE};
  }

  ${BREAKPOINT_PAD} {
    margin-top: ${HEADER_HEIGHT_PAD};
  }
`;

const PageTitle = styled.h1.attrs(() => ({
  className: "fs-h1",
}))`
  color: ${COLOR_SECONDARY2};
  padding-top: 1rem;
  margin-left: 1rem;
  margin-bottom: 2rem;

  // 根據不同裝置寬度預設跟 Header 保持 margin-top: 0
  ${BREAKPOINT_MOBILE} {
    margin-top: calc(${HEADER_HEIGHT_MOBILE});
  }

  ${BREAKPOINT_PAD} {
    margin-top: calc(${HEADER_HEIGHT_PAD});
  }
`;

const ContentTitle = styled.h2.attrs(() => ({
  className: "fs-h2",
}))`
  text-align: center;
  margin-bottom: 2rem;
`;

export default function FavoritePage() {
  // 透過 history hook 換頁
  const history = useHistory();
  // 產生 dispatch
  const dispatch = useReduxDispatch();
  // 從 redux-store 拿喜好清單
  const favoriteItemsFromStore = useReduxSelector(
    (store) => store.favoriteItems.items
  );
  // 用來暫存要被刪除的收藏產品
  const tmpRemovingItem = useRef<null | number>(null);
  // 頁面的產品收藏清單
  const [items, setItems] = useState(favoriteItemsFromStore);
  // 是否顯示移除收藏產品的 modal 提示
  const [
    showModalForRemovingFavoriteItem,
    setShowModalForRemovingFavoriteItem,
  ] = useState(false);
  // 收藏產品的 modal 資訊
  const [modalInfoForRemovingFavoriteItem] = useState({
    selectionMode: true,
    title: "從收藏清單中移除？",
    content: "此操作將會從此頁面直接移除，確定嗎？",
  });

  // 點擊愛心圖示事件
  function handleLiked(id: number): void {
    setShowModalForRemovingFavoriteItem(true);
    tmpRemovingItem.current = id;
  }
  // modal 顯示情境: 要否要刪除收藏產品
  // 處理點選按鈕事件
  function handleSubmitOpForRemovingFavoriteItem(): void {
    setShowModalForRemovingFavoriteItem(false);
    const id = tmpRemovingItem.current;
    setItems(items.filter((item) => item.id !== id));
  }
  // modal 顯示情境: 是否要刪除收藏產品
  // 處理點選按鈕以外的事件
  function handleCancelOpForRemovingFavoriteItem(): void {
    setShowModalForRemovingFavoriteItem(false);
  }
  // 導引到相對應產品的畫面
  function handleRedirectToProductPage(e: React.MouseEvent<HTMLElement>): void {
    const el = e.target as HTMLElement;
    const id = el.getAttribute("data-id");
    history.push(`/product/${id}`);
  }

  // 當本地的收藏清單更新時，同步更新 redux-store 的喜好清單
  useEffect(() => {
    dispatch(addFavoriteItem(items));
  }, [items, dispatch]);

  return (
    <PageContainer>
      <Header />
      <ContentContainer>
        <PageTitle>收藏清單</PageTitle>
        {items.length === 0 ? (
          <>
            <ContentTitle>目前還沒有產品喔，先去逛逛吧！</ContentTitle>
            <CTAPrimaryButton
              isRounded={true}
              margin={"0 auto"}
              onClick={() => {
                history.push("/");
              }}
            >
              首頁
            </CTAPrimaryButton>
          </>
        ) : (
          <CardContainer
            items={items}
            handleLiked={handleLiked}
            handleOnClick={handleRedirectToProductPage}
            useForLikedItem={true}
          ></CardContainer>
        )}
        {showModalForRemovingFavoriteItem && (
          <Modal
            modalInfo={modalInfoForRemovingFavoriteItem}
            handleSubmitOp={handleSubmitOpForRemovingFavoriteItem}
            handleCancelOp={handleCancelOpForRemovingFavoriteItem}
          />
        )}
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
}
