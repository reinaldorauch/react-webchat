import React from 'react';
import Member from './Member';

import './MemberList.css'

export default class MemberList extends React.Component {
  render() {
    const memberList = this.props.members.map(
      (member, index) => <Member key={index} member={member} />
    );
    return (
      <div className="member-list">
        {memberList}
      </div>
    );
  }
}