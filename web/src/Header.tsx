import styled from "styled-components"

const HeaderWrapper = styled.div`
    display: grid;
    grid-template-rows: 1fr 4fr;

    button {
        background: none!important;
        border: none;
        padding: 0!important;
        color: -webkit-link;
        text-decoration: underline;
        cursor: pointer;
        justify-self: end;
        width: fit-content;
    }

    h1 {
        justify-self: center;
    }
`

export function Header(props: HeaderProps) {
    return (
        <HeaderWrapper id="header">
            {props.isAuthenticated ? <button onClick={() => props.handleLogout()}>Logout</button> : <div></div>}
            <h1>File Browser</h1>
        </HeaderWrapper>
    )
}

type HeaderProps = {
    handleLogout: () => void;
    isAuthenticated: boolean;
}