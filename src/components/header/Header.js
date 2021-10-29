import { ReactComponent as logo } from "../../imgs/components/header/bootstrap.svg";
import { ReactComponent as list } from "../../imgs/components/header/list.svg";
import { ReactComponent as profile } from "../../imgs/components/header/person-circle.svg";
import { ReactComponent as shopping_bag } from "../../imgs/components/header/bag.svg";
import DropDown from "../../components/dropdown/DropDown";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import {
  BREAKPOINT_LAPTOP,
  BREAKPOINT_MOBILE,
  BREAKPOINT_PAD,
  Z_INDEX_LV4,
  HEADER_HEIGHT_MOBILE,
  HEADER_HEIGHT_PAD,
  BOX_SHADOW_LIGHT,
  COLOR_PRIMARY2,
  COLOR_PRIMARY1,
  COLOR_SECONDARY1,
} from "../../constant";
import { useState } from "react";

const NavBarContainer = styled.nav.attrs(() => ({
  className: "bg-secondary3",
}))`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: ${Z_INDEX_LV4};
  height: ${HEADER_HEIGHT_MOBILE};
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: ${BOX_SHADOW_LIGHT};

  ${BREAKPOINT_MOBILE} {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  ${BREAKPOINT_PAD} {
    height: ${HEADER_HEIGHT_PAD};
  }

  // 裝置尺寸為 1440px 寬時，將 NavBar 固定為 1440px 寬
  ${BREAKPOINT_LAPTOP} {
    padding-left: calc((100% - 90rem) / 2);
    padding-right: calc((100% - 90rem) / 2);
  }
`;

const BrandLogo = styled(logo).attrs(() => ({
  className: "color-secondary2",
}))`
  width: 2rem;
  height: 2rem;
  cursor: pointer;

  ${BREAKPOINT_PAD} {
    width: 2.4rem;
    height: 2.4rem;
  }
`;
const HamburgerButton = styled(list)`
  width: 2rem;
  height: 2rem;
  cursor: pointer;

  ${BREAKPOINT_PAD} {
    display: none;
  }
`;

const FeatureContainer = styled.div`
  display: none;

  ${BREAKPOINT_PAD} {
    display: flex;
  }
`;

const ProfileContainer = styled.div`
  display: none;

  ${BREAKPOINT_PAD} {
    display: flex;
    align-items: center;
    margin-right: 2rem;
    cursor: pointer;
  }
`;

const ProfileIcon = styled(profile)`
  ${BREAKPOINT_PAD} {
    width: 2.4rem;
    height: 2.4rem;
    cursor: pointer;
    margin-right: 1rem;
  }
`;

const UserNickname = styled.h3.attrs(() => ({
  className: "fs-h3",
}))``;

const ShoppingBag = styled(shopping_bag)`
  ${BREAKPOINT_PAD} {
    width: 2.4rem;
    height: 2.4rem;
    cursor: pointer;
  }
`;

export default function Header() {
  const [dropDownForProfile, setDropDownForProfile] = useState({
    width: "10rem",
    useForLinks: true,
    options: [
      { id: 1, name: "登入", url: "/login" },
      { id: 2, name: "註冊", url: "/register" },
      { id: 3, name: "登出", url: "/logout" },
    ],
  });
  const [dropDownForBag, setDropDownForBag] = useState({
    useForBag: true,
    products: [
      {
        id: 1,
        name: "連身套裝連身套裝連身套裝連身套裝連身套裝",
        url: "https://i.imgur.com/RVnJagG.jpg",
        color: COLOR_PRIMARY2,
        size: "XL",
        quantity: "2",
      },
      {
        id: 2,
        name: "黑色西裝外套",
        url: "https://i.imgur.com/Eyg3mUD.jpg",
        color: COLOR_PRIMARY1,
        size: "M",
        quantity: "1",
      },
      {
        id: 3,
        name: "針織細肩內衣",
        url: "https://i.imgur.com/wHozlKZ.jpg",
        color: COLOR_SECONDARY1,
        size: "S",
        quantity: "4",
      },
    ],
  });
  return (
    <NavBarContainer>
      <Link to="/">
        <BrandLogo />
      </Link>
      <HamburgerButton />
      <FeatureContainer>
        <DropDown dropDownInfo={dropDownForProfile}>
          <ProfileContainer>
            <ProfileIcon />
            <UserNickname>訪客</UserNickname>
          </ProfileContainer>
        </DropDown>
        <DropDown dropDownInfo={dropDownForBag}>
          <ShoppingBag />
        </DropDown>
      </FeatureContainer>
    </NavBarContainer>
  );
}
