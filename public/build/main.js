//声明组件
var R_header = React.createClass({
	getInitialState:function(){
		return {title:456};
	},
	render:function(){
		return <header>{this.state.title}</header>;
	}
});

var R_footer = React.createClass({
	render:function(){
		return <footer>{this.props.title}</footer>;
	}
});

React.render(
	<div>
		<R_header />
		<R_footer title='尾部' />
	</div>,
	document.getElementById('container')
);